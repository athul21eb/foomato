import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

export interface CreateCheckoutSessionOptions {
  orderId: string;
  amount: number;
  currency?: string;
  productName?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

@Injectable()
export class StripeService implements OnModuleInit {
  private readonly logger = new Logger(StripeService.name);
  private client!: Stripe;
  private secretKey!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.secretKey = this.configService.getOrThrow<string>('STRIPE_SECRET_KEY');
    this.client = new Stripe(this.secretKey);
    this.logger.log('💳 Stripe client initialized successfully.');
  }

  public getClient(): Stripe {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Stripe client is not initialized. Ensure STRIPE_SECRET_KEY is configured.',
      );
    }
    return this.client;
  }

  /**
   * Create a Stripe Checkout Session for order payment
   */
  public async createCheckoutSession(
    options: CreateCheckoutSessionOptions,
  ): Promise<Stripe.Checkout.Session> {
    const client = this.getClient();
    const currency = (options.currency || 'inr').toLowerCase();
    const unitAmount = Math.round(options.amount * 100);

    const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');

    const successUrl =
      options.successUrl ||
      `${frontendUrl}/ordersuccess?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl =
      options.cancelUrl ||
      `${frontendUrl}/payment-failed?orderId=${options.orderId}&reason=Payment+was+cancelled+at+checkout`;

    try {
      const session = await client.checkout.sessions.create({
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: options.productName || 'Foomato Food Order',
              },
              unit_amount: unitAmount,
            },
            quantity: 1,
          },
        ],
        metadata: {
          orderId: options.orderId,
          ...options.metadata,
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      this.logger.log(
        `Created Stripe checkout session: ${session.id} for order ${options.orderId}`,
      );
      return session;
    } catch (error) {
      this.logger.error(
        `Failed to create Stripe checkout session for order ${options.orderId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to create Stripe session');
    }
  }

  /**
   * Retrieve a Stripe Checkout Session by ID
   */
  public async retrieveSession(
    sessionId: string,
  ): Promise<Stripe.Checkout.Session> {
    const client = this.getClient();
    try {
      return await client.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      this.logger.error(
        `Failed to retrieve Stripe session ${sessionId}`,
        error,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve Stripe session',
      );
    }
  }

  /**
   * Construct and verify webhook event payload
   */
  public constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    secret?: string,
  ): Stripe.Event {
    const client = this.getClient();
    const webhookSecret =
      secret || this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is not configured for webhook verification',
      );
    }

    try {
      return client.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      this.logger.error('Invalid Stripe webhook signature', error);
      throw new InternalServerErrorException(
        'Invalid Stripe webhook signature',
      );
    }
  }
}
