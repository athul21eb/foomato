import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { OrderStatus } from '../domain/order.entity';

export const SellerAllowedStatuses = [
  OrderStatus.ACCEPTED,
  OrderStatus.PREPARING,
  OrderStatus.READY_FOR_RIDER,
  OrderStatus.CANCELLED,
] as const;

export type SellerAllowedOrderStatus = (typeof SellerAllowedStatuses)[number];

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'status is required' })
  @IsEnum(SellerAllowedStatuses, {
    message: `status must be one of: ${SellerAllowedStatuses.join(', ')}`,
  })
  status!: SellerAllowedOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300, {
    message: 'Reason cannot exceed 300 characters',
  })
  reason?: string;
}
