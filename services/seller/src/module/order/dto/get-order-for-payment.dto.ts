import { IsMongoId, IsNotEmpty } from 'class-validator';

export class GetOrderForPaymentDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsMongoId({ message: 'Invalid order ID format' })
  orderId: string;
}
