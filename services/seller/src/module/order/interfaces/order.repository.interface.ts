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
  updateStatus(
    id: string,
    status: OrderStatus,
    reason?: string,
  ): Promise<OrderEntity | null>;

  updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
  ): Promise<OrderEntity | null>;
  findActivePendingByUserId(userId: string): Promise<OrderEntity | null>;
  updatePaymentMethod(
    id: string,
    paymentMethod: string,
  ): Promise<OrderEntity | null>;
  findSellerOrders(
    restaurantId: string,
    page: number,
    limit: number,
    status?: OrderStatus,
  ): Promise<{
    orders: OrderEntity[];
    total: number;
    counts?: Record<string, number>;
  }>;
  findUserOrders(
    userId: string,
    page: number,
    limit: number,
    tab?: string,
  ): Promise<{
    orders: OrderEntity[];
    total: number;
    counts: {
      all: number;
      inProgress: number;
      delivered: number;
      cancelled: number;
    };
  }>;
  assignRiderAtomic(
    orderId: string,
    riderId: string,
    riderName: string,
    riderPhone: string,
  ): Promise<OrderEntity | null>;
  findCurrentActiveByRiderId(riderId: string): Promise<OrderEntity | null>;
  updateStatusByRider(
    orderId: string,
    riderId: string,
    targetStatus: OrderStatus,
  ): Promise<OrderEntity | null>;
}
