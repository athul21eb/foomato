import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RazorpayService } from '../../lib/razorpay/razorpay.service';
import { StripeService } from '../../lib/stripe/stripe.service';
import { RabbitmqService } from '../../lib/rabbitmq/rabbitmq.service';
import { RequestContext } from '../../common/context/request-context';
import { OrderGrpcService } from '../../lib/order-grpc/order-grpc.service';
import type { GetOrderForPaymentResponse } from '../../lib/order-grpc/interfaces/order-grpc.interface';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto';
import { PayWithStripeDto } from './dto/pay-with-stripe.dto';
import { VerifyStripeDto } from './dto/verify-stripe.dto';

export interface PaymentSuccessPayload {
  orderId: string;
  paymentId: string;
  provider: 'razorpay' | 'stripe';
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly orderGrpcService: OrderGrpcService,
    private readonly razorpayService: RazorpayService,
    private readonly stripeService: StripeService,
    private readonly rabbitmqService: RabbitmqService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Helper to synchronously query order details from Seller service via gRPC
   */
  private async fetchOrderViaGrpc(
    orderId: string,
  ): Promise<GetOrderForPaymentResponse> {
    try {
      const order = await this.orderGrpcService.getOrderForPayment(orderId);

      if (!order?.orderId) {
        throw new NotFoundException(`Order ${orderId} not found`);
      }

      if (order.paymentStatus !== 'pending') {
        throw new BadRequestException(
          `Order ${orderId} is already ${order.paymentStatus}`,
        );
      }

      return order;
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Failed to fetch order ${orderId} via gRPC: ${err.message}`,
        err.stack,
      );
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const grpcDetails =
        typeof error === 'object' &&
        error !== null &&
        'details' in error &&
        typeof (error as Record<string, unknown>).details === 'string'
          ? (error as { details: string }).details
          : undefined;

      throw new BadRequestException(
        grpcDetails ||
          err.message ||
          'Unable to retrieve order details for payment',
      );
    }
  }

  /**
   * Publish payment success event to RabbitMQ queue
   */
  public async publishPaymentSuccess(
    payload: PaymentSuccessPayload,
  ): Promise<void> {
    const queue = this.configService.getOrThrow<string>('PAYMENT_QUEUE');

    const event = {
      type: 'PAYMENT_SUCCESS',
      data: payload,
      correlationId: RequestContext.getCorrelationId(),
      timestamp: new Date().toISOString(),
    };

    await this.rabbitmqService.publish(queue, event);
    this.logger.log(
      `📢 Published PAYMENT_SUCCESS event for order ${payload.orderId} via ${payload.provider}`,
    );
  }

  /**
   * Create Razorpay payment order
   */
  public async createRazorpayOrder(dto: CreateRazorpayOrderDto) {
    const order = await this.fetchOrderViaGrpc(dto.orderId);

    const razorpayOrder = await this.razorpayService.createOrder({
      amount: order.amount,
      currency: order.currency || 'INR',
      receipt: dto.orderId,
    });

    const key = this.configService.getOrThrow<string>('RAZORPAY_KEY_ID');

    this.logger.log(
      `Created Razorpay order: ${razorpayOrder.id} for order ${dto.orderId} (Amount: ₹${Number(razorpayOrder.amount) / 100})`,
    );

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key,
    };
  }

  /**
   * Verify Razorpay payment signature and publish event
   */
  public async verifyRazorpayPayment(dto: VerifyRazorpayDto) {
    const isValid = this.razorpayService.verifyPaymentSignature({
      orderId: dto.razorpay_order_id,
      paymentId: dto.razorpay_payment_id,
      signature: dto.razorpay_signature,
    });

    if (!isValid) {
      throw new BadRequestException('Payment verification failed');
    }

    await this.publishPaymentSuccess({
      orderId: dto.orderId,
      paymentId: dto.razorpay_payment_id,
      provider: 'razorpay',
    });

    return {
      message: 'Payment verified successfully',
    };
  }

  /**
   * Create Stripe Checkout session
   */
  public async payWithStripe(dto: PayWithStripeDto) {
    const order = await this.fetchOrderViaGrpc(dto.orderId);

    const session = await this.stripeService.createCheckoutSession({
      orderId: dto.orderId,
      amount: order.amount,
      currency: order.currency || 'inr',
    });

    this.logger.log(
      `Created Stripe Checkout session: ${session.id} for order ${dto.orderId} (Amount: ₹${order.amount})`,
    );

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  /**
   * Verify Stripe Checkout session and publish event
   */
  public async verifyStripePayment(dto: VerifyStripeDto) {
    try {
      const session = await this.stripeService.retrieveSession(dto.sessionId);

      if (!session) {
        throw new BadRequestException(
          'Payment verification failed: session not found',
        );
      }

      if (session.payment_status !== 'paid') {
        throw new BadRequestException(
          `Payment not completed. Current status: ${session.payment_status}`,
        );
      }

      const orderId = session.metadata?.orderId;
      if (!orderId) {
        throw new BadRequestException(
          'Order ID not found in Stripe session metadata',
        );
      }

      await this.publishPaymentSuccess({
        orderId,
        paymentId: session.id,
        provider: 'stripe',
      });

      return {
        message: 'Payment verified successfully',
        orderId,
      };
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(
        `Stripe payment verification failed: ${err.message}`,
        err.stack,
      );
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        err.message || 'Stripe payment verification failed',
      );
    }
  }
}
