import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { RabbitmqService } from '../../../lib/rabbitmq/rabbitmq.service';
import { OrderService } from '../order.service';
import { RealtimeEmitterService } from '../../../lib/realtime-grpc/realtime-emitter.service';
import { RequestContext } from '../../../common/context/request-context';

export interface PaymentSuccessMessage {
  type: string;
  data: {
    orderId: string;
    paymentId: string;
    provider: 'razorpay' | 'stripe';
  };
  correlationId?: string;
  timestamp?: string;
}

@Injectable()
export class PaymentSuccessConsumer implements OnModuleInit {
  private readonly logger = new Logger(PaymentSuccessConsumer.name);

  constructor(
    private readonly rabbitmqService: RabbitmqService,
    private readonly orderService: OrderService,
    private readonly configService: ConfigService,
    private readonly realtimeEmitter: RealtimeEmitterService,
  ) {}

  async onModuleInit(): Promise<void> {
    const queue = this.configService.getOrThrow<string>('PAYMENT_QUEUE');

    try {
      await this.rabbitmqService.consume<PaymentSuccessMessage>(
        queue,
        async (message) => {
          await this.handleMessage(message);
        },
      );
      this.logger.log(`Listening for payment events on queue "${queue}"`);
    } catch (error) {
      this.logger.error(
        `Failed to start PaymentSuccessConsumer on queue "${queue}"`,
        error,
      );
    }
  }

  private async handleMessage(message: PaymentSuccessMessage): Promise<void> {
    if (message?.type !== 'PAYMENT_SUCCESS' || !message.data?.orderId) {
      this.logger.warn(
        `Ignored unrecognized message payload: ${JSON.stringify(message)}`,
      );
      return;
    }

    const { orderId, paymentId, provider } = message.data;
    const correlationId = message.correlationId || randomUUID();

    await RequestContext.run({ correlationId }, async () => {
      this.logger.log(
        `📥 Processing payment success for order ${orderId} via ${provider} (${paymentId})`,
      );

      try {
        const order = await this.orderService.updatePaymentStatus(
          orderId,
          'paid',
        );
        this.logger.log(`Order ${orderId} marked as paid successfully`);

        await this.realtimeEmitter.emitToSeller(
          order.restaurantId,
          'order:new',
          {
            orderId: order.id,
            orderNumber: order.orderNumber,
            totalAmount: order.totalAmount,
            itemsCount: order.items?.length || 0,
          },
        );
        this.logger.log(
          `📶 Emitted "order:new" (#${order.orderNumber || order.id}) to seller ${order.restaurantId}`,
        );
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.error(
          `Failed to update payment status for order ${orderId}: ${err.message}`,
          err.stack,
        );
      }
    });
  }
}
