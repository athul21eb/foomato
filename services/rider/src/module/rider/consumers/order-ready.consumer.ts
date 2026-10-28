import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RabbitmqService } from '../../../lib/rabbitmq/rabbitmq.service';
import { RealtimeEmitterService } from '../../../lib/realtime-grpc/realtime-emitter.service';
import { RequestContext } from '../../../common/context/request-context';
import {
  RIDER_REPOSITORY,
  type IRiderRepository,
} from '../interfaces/rider.repository.interface';

export interface OrderReadyMessage {
  type: string;
  data: {
    orderId: string;
    orderNumber?: string;
    restaurantId: string;
    restaurantName: string;
    location: {
      type: 'Point';
      coordinates: [number, number]; // [longitude, latitude]
      formattedAddress?: string;
    };
    dropoffLocation?: {
      formattedAddress?: string;
      latitude?: number;
      longitude?: number;
      mobile?: number;
    };
    totalAmount?: number;
    riderAmount?: number;
  };
  correlationId?: string;
  timestamp?: string;
}

@Injectable()
export class OrderReadyConsumer implements OnModuleInit {
  private readonly logger = new Logger(OrderReadyConsumer.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly configService: ConfigService,
    private readonly realtimeEmitter: RealtimeEmitterService,
    @Inject(RIDER_REPOSITORY)
    private readonly riderRepository: IRiderRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const queue = this.configService.getOrThrow<string>('ORDER_READY_QUEUE');

    try {
      await this.rabbitmqService.consume<OrderReadyMessage>(
        queue,
        async (message) => {
          await this.handleMessage(message);
        },
      );
      this.logger.log(`🎧 Listening for order-ready events on queue "${queue}"`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to start OrderReadyConsumer on queue "${queue}": ${message}`,
      );
    }
  }

  private async handleMessage(message: OrderReadyMessage): Promise<void> {
    if (message?.type !== 'ORDER_READY_FOR_RIDER' || !message.data?.orderId) {
      this.logger.warn(
        `Ignored non-ORDER_READY_FOR_RIDER event: ${JSON.stringify(message?.type)}`,
      );
      return;
    }

    const {
      orderId,
      orderNumber,
      restaurantId,
      restaurantName,
      location,
      dropoffLocation,
      riderAmount,
      totalAmount,
    } = message.data;

    const correlationId = message.correlationId || randomUUID();

    await RequestContext.run({ correlationId }, async () => {
      this.logger.log(
        `📥 Received ORDER_READY_FOR_RIDER for order ${orderId} (#${orderNumber || orderId}) from restaurant "${restaurantName}" (${restaurantId})`,
      );

      if (!location?.coordinates || location.coordinates.length < 2) {
        this.logger.error(
          `Cannot match riders for order ${orderId}: Missing restaurant coordinates`,
        );
        return;
      }

      try {
        const nearbyRiders = await this.riderRepository.findNearbyAvailable(
          location.coordinates,
          5000, // 5km search radius
        );

        this.logger.log(
          `Found ${nearbyRiders.length} verified & available rider(s) within 5km for order ${orderId}`,
        );

        if (nearbyRiders.length === 0) {
          this.logger.warn(
            `No available riders currently near restaurant ${restaurantId} for order ${orderId}`,
          );
          return;
        }

        const notificationPayload = {
          orderId,
          orderNumber,
          restaurantId,
          restaurantName,
          pickupLocation: location,
          dropoffLocation,
          riderAmount,
          totalAmount,
        };

        const notifications = nearbyRiders.map(async (rider) => {
          const sent = await this.realtimeEmitter.emitToRider(
            rider.id,
            'order:available',
            notificationPayload,
          );
          if (sent) {
            this.logger.log(
              `🔔 Dispatched "order:available" via gRPC to rider ${rider.id} (user: ${rider.userId})`,
            );
          } else {
            this.logger.warn(
              `Failed to dispatch "order:available" gRPC notification to rider ${rider.id}`,
            );
          }
        });

        await Promise.allSettled(notifications);
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error(
          `Error matching/notifying riders for order ${orderId}: ${err.message}`,
          err.stack,
        );
      }
    });
  }
}
