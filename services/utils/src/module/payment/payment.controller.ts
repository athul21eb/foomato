import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { VerifyRazorpayDto } from './dto/verify-razorpay.dto';
import { PayWithStripeDto } from './dto/pay-with-stripe.dto';
import { VerifyStripeDto } from './dto/verify-stripe.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller('payment')
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  @Post('razorpay/order')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Razorpay order created successfully')
  async createRazorpayOrder(@Body() dto: CreateRazorpayOrderDto) {
    this.logger.log(
      `Received request to create Razorpay order for: ${dto.orderId}`,
    );
    return this.paymentService.createRazorpayOrder(dto);
  }

  @Post('razorpay/verify')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Razorpay payment verified successfully')
  async verifyRazorpayPayment(@Body() dto: VerifyRazorpayDto) {
    this.logger.log(
      `Received Razorpay signature verification for order: ${dto.orderId} (${dto.razorpay_payment_id})`,
    );
    return this.paymentService.verifyRazorpayPayment(dto);
  }

  @Post('stripe/pay')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Stripe checkout session created successfully')
  async payWithStripe(@Body() dto: PayWithStripeDto) {
    this.logger.log(
      `Received request to create Stripe session for: ${dto.orderId}`,
    );
    return this.paymentService.payWithStripe(dto);
  }

  @Post('stripe/verify')
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Stripe payment verified successfully')
  async verifyStripePayment(@Body() dto: VerifyStripeDto) {
    this.logger.log(
      `Received Stripe session verification for session: ${dto.sessionId}`,
    );
    return this.paymentService.verifyStripePayment(dto);
  }
}
