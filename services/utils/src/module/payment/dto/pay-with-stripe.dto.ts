import { IsNotEmpty, IsString } from 'class-validator';

export class PayWithStripeDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  orderId!: string;
}
