import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import type { PaymentMethod } from '../domain/order.entity';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'Address is required' })
  @IsMongoId({ message: 'Invalid address ID format' })
  addressId: string;

  @IsNotEmpty({ message: 'Payment method is required' })
  @IsEnum(['razorpay', 'stripe'], {
    message: 'Payment method must be razorpay or stripe',
  })
  paymentMethod: PaymentMethod;
}
