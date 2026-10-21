import {
  OrderEntity,
  OrderStatus,
  PaymentStatus,
} from '../domain/order.entity';

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');

export interface IOrderRepository {
  create(order: Partial<OrderEntity>): Promise<OrderEntity>;
  findById(id: string): Promise<OrderEntity | null>;
  findByUserId(userId: string): Promise<OrderEntity[]>;
  findByRestaurantId(restaurantId: string): Promise<OrderEntity[]>;
  updateStatus(id: string, status: OrderStatus): Promise<OrderEntity | null>;
  updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderEntity | null>;
}
