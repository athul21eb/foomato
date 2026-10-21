import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Orders } from 'razorpay/dist/types/orders';
import { Payments } from 'razorpay/dist/types/payments';

export interface CreateRazorpayOrderOptions {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  /**
   * If true, amount is treated as already in subunits (paise).
   * If false or undefined (default), amount is treated as rupees and converted (x100).
   */
  isSubunits?: boolean;
}

export interface VerifyPaymentSignatureOptions {
  orderId: string;
  paymentId: string;
  signature: string;
}

@Injectable()
export class RazorpayService implements OnModuleInit {
  private readonly logger = new Logger(RazorpayService.name);
  private client!: Razorpay;
  private keyId!: string;
  private keySecret!: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      this.logger.warn(
        'RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing in environment variables. Razorpay initialization deferred.',
      );
      return;
    }

    this.keyId = keyId;
    this.keySecret = keySecret;

    this.client = new Razorpay({
      key_id: this.keyId,
      key_secret: this.keySecret,
    });

    this.logger.log('💳 Razorpay client initialized successfully.');
  }

  /**
   * Access the initialized Razorpay SDK instance for direct access
   */
  public getClient(): Razorpay {
    if (!this.client) {
      throw new InternalServerErrorException(
        'Razorpay client is not initialized. Ensure valid credentials in environment.',
      );
    }
    return this.client;
  }

  /**
   * Create a payment order in Razorpay
   */
  public async createOrder(
    options: CreateRazorpayOrderOptions,
  ): Promise<Orders.RazorpayOrder> {
    const client = this.getClient();
    const currency = options.currency || 'INR';

    const amountInSubunits = options.isSubunits
      ? Math.round(options.amount)
      : Math.round(options.amount * 100);

    try {
      const order = await client.orders.create({
        amount: amountInSubunits,
        currency,
        receipt: options.receipt || `order_rcpt_${Date.now()}`,
        notes: options.notes,
      });

      this.logger.log(
        `Created Razorpay order: ${order.id} for ${amountInSubunits} ${currency}`,
      );
      return order;
    } catch (error) {
      this.logger.error('Failed to create Razorpay order', error);
      throw new InternalServerErrorException(
        'Failed to generate Razorpay payment order',
      );
    }
  }

  /**
   * Timing-safe verification of standard Razorpay checkout payment signature
   * HMAC SHA-256 over `${orderId}|${paymentId}`
   */
  public verifyPaymentSignature(
    options: VerifyPaymentSignatureOptions,
  ): boolean {
    const { orderId, paymentId, signature } = options;

    if (!orderId || !paymentId || !signature) {
      return false;
    }

    if (!this.keySecret) {
      this.logger.error(
        'RAZORPAY_KEY_SECRET is not available for signature verification.',
      );
      return false;
    }

    try {
      const body = `${orderId}|${paymentId}`;
      const expectedSignature = crypto
        .createHmac('sha256', this.keySecret)
        .update(body)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const signatureBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (error) {
      this.logger.error('Error verifying Razorpay payment signature', error);
      return false;
    }
  }

  /**
   * Timing-safe verification of Razorpay Webhook signatures
   */
  public verifyWebhookSignature(
    rawBody: string,
    signature: string,
    webhookSecret?: string,
  ): boolean {
    const secret =
      webhookSecret ||
      this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET') ||
      this.keySecret;

    if (!rawBody || !signature || !secret) {
      return false;
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBody)
        .digest('hex');

      const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
      const signatureBuffer = Buffer.from(signature, 'utf-8');

      if (expectedBuffer.length !== signatureBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
    } catch (error) {
      this.logger.error('Error verifying Razorpay webhook signature', error);
      return false;
    }
  }

  /**
   * Fetch order details by order ID
   */
  public async fetchOrder(orderId: string): Promise<Orders.RazorpayOrder> {
    const client = this.getClient();
    try {
      return await client.orders.fetch(orderId);
    } catch (error) {
      this.logger.error(`Failed to fetch Razorpay order ${orderId}`, error);
      throw new InternalServerErrorException(
        `Failed to fetch order ${orderId}`,
      );
    }
  }

  /**
   * Fetch payment details by payment ID
   */
  public async fetchPayment(
    paymentId: string,
  ): Promise<Payments.RazorpayPayment> {
    const client = this.getClient();
    try {
      return await client.payments.fetch(paymentId);
    } catch (error) {
      this.logger.error(`Failed to fetch Razorpay payment ${paymentId}`, error);
      throw new InternalServerErrorException(
        `Failed to fetch payment ${paymentId}`,
      );
    }
  }
}
