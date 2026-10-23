import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRazorpayOrderDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsString({ message: 'Order ID must be a string' })
  orderId!: string;
}
