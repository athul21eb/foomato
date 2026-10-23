import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private isShuttingDown = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    await this.connectWithRetry();
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    this.logger.log(
      `Shutting down RabbitMQ connection (signal: ${signal || 'none'})...`,
    );
    this.isShuttingDown = true;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('RabbitMQ channel and connection closed gracefully.');
    } catch (error) {
      this.logger.error('Error while closing RabbitMQ connection', error);
    }
  }

  /**
   * Connect to RabbitMQ broker and initialize channel with retry logic
   */
  private async connectWithRetry(retries = 5, delayMs = 3000): Promise<void> {
    const rabbitmqUrl = this.configService.getOrThrow<string>('RABBITMQ_URL');

    for (let attempt = 1; attempt <= retries; attempt++) {
      if (this.isShuttingDown) return;

      try {
        this.logger.log(
          `Connecting to RabbitMQ broker (attempt ${attempt}/${retries})...`,
        );
        const connection = await amqp.connect(rabbitmqUrl);

        connection.on('error', (err: Error) => {
          this.logger.error('RabbitMQ connection error occurred', err);
          this.handleDisconnect();
        });

        connection.on('close', () => {
          if (!this.isShuttingDown) {
            this.logger.warn(
              'RabbitMQ connection closed unexpectedly. Scheduling reconnect...',
            );
            this.handleDisconnect();
          }
        });

        const channel = await connection.createChannel();

        channel.on('error', (err: Error) => {
          this.logger.error('RabbitMQ channel error occurred', err);
        });

        channel.on('close', () => {
          this.logger.warn('RabbitMQ channel closed.');
        });

        this.connection = connection;
        this.channel = channel;

        // Assert standard queues configured in environment
        const paymentQueue =
          this.configService.getOrThrow<string>('PAYMENT_QUEUE');
        await this.assertQueue(paymentQueue, { durable: true });

        this.logger.log(
          `🐇 Connected to RabbitMQ successfully. Queue "${paymentQueue}" asserted.`,
        );
        return;
      } catch (error) {
        this.logger.error(
          `Failed to connect to RabbitMQ on attempt ${attempt}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        if (attempt < retries) {
          this.logger.log(`Retrying in ${delayMs / 1000}s...`);
          await new Promise((res) => setTimeout(res, delayMs));
        } else {
          this.logger.warn(
            'Could not establish RabbitMQ connection during initialization. Will retry asynchronously in the background.',
          );
          this.scheduleReconnect();
        }
      }
    }
  }

  private handleDisconnect(): void {
    this.channel = null;
    this.connection = null;
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    if (this.isShuttingDown || this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      if (!this.isShuttingDown && !this.isConnected()) {
        void this.connectWithRetry(3, 5000);
      }
    }, 5000);
  }

  /**
   * Check if connection and channel are active
   */
  public isConnected(): boolean {
    return Boolean(this.connection && this.channel);
  }

  /**
   * Access underlying amqplib Channel instance
   */
  public getChannel(): amqp.Channel {
    if (!this.channel) {
      throw new Error(
        'RabbitMQ channel is not available. Check broker connection status.',
      );
    }
    return this.channel;
  }

  /**
   * Access underlying amqplib Connection instance
   */
  public getConnection(): amqp.ChannelModel {
    if (!this.connection) {
      throw new Error(
        'RabbitMQ connection is not available. Check broker connection status.',
      );
    }
    return this.connection;
  }

  /**
   * Assert a durable or transient queue
   */
  public async assertQueue(
    queue: string,
    options: amqp.Options.AssertQueue = { durable: true },
  ): Promise<amqp.Replies.AssertQueue> {
    const channel = this.getChannel();
    return channel.assertQueue(queue, options);
  }

  /**
   * Publish a strongly-typed JSON message to a queue
   */
  public async publish<T>(
    queue: string,
    message: T,
    options: amqp.Options.Publish = { persistent: true },
  ): Promise<boolean> {
    const channel = this.getChannel();
    await this.assertQueue(queue, { durable: true });

    const content = Buffer.from(JSON.stringify(message));
    return channel.sendToQueue(queue, content, {
      contentType: 'application/json',
      ...options,
    });
  }

  /**
   * Consume strongly-typed messages from a queue with automatic parsing and acknowledgement handling
   */
  public async consume<T>(
    queue: string,
    onMessage: (data: T, raw: amqp.ConsumeMessage) => Promise<void> | void,
    options: amqp.Options.Consume = { noAck: false },
  ): Promise<amqp.Replies.Consume> {
    const channel = this.getChannel();
    await this.assertQueue(queue, { durable: true });

    return channel.consume(
      queue,
      (raw) => {
        if (!raw) return;

        void (async () => {
          try {
            const parsed = JSON.parse(
              raw.content.toString('utf-8'),
            ) as unknown as T;
            await onMessage(parsed, raw);

            if (!options.noAck) {
              channel.ack(raw);
            }
          } catch (error) {
            this.logger.error(
              `Error processing message from queue "${queue}"`,
              error,
            );
            if (!options.noAck) {
              // Do not requeue by default to avoid poison pill loops
              channel.nack(raw, false, false);
            }
          }
        })();
      },
      options,
    );
  }
}
