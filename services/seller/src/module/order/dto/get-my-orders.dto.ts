import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export const CUSTOMER_ORDER_TABS = [
  'all',
  'in_progress',
  'delivered',
  'cancelled',
] as const;
export type CustomerOrderTab = (typeof CUSTOMER_ORDER_TABS)[number];

export class GetMyOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsIn(CUSTOMER_ORDER_TABS, {
    message: `tab must be one of: ${CUSTOMER_ORDER_TABS.join(', ')}`,
  })
  tab: CustomerOrderTab = 'all';
}
