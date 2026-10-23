import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyRazorpayDto {
  @IsNotEmpty({ message: 'razorpay_order_id is required' })
  @IsString({ message: 'razorpay_order_id must be a string' })
  razorpay_order_id!: string;

  @IsNotEmpty({ message: 'razorpay_payment_id is required' })
  @IsString({ message: 'razorpay_payment_id must be a string' })
  razorpay_payment_id!: string;

  @IsNotEmpty({ message: 'razorpay_signature is required' })
  @IsString({ message: 'razorpay_signature must be a string' })
  razorpay_signature!: string;

  @IsNotEmpty({ message: 'orderId is required' })
  @IsString({ message: 'orderId must be a string' })
  orderId!: string;
}
