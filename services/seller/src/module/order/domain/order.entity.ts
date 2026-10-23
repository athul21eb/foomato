export const OrderStatus = {
  PLACED: 'placed',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY_FOR_RIDER: 'ready_for_rider',
  RIDER_ASSIGNED: 'rider_assigned',
  PICKED_UP: 'picked_up',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const PaymentMethod = {
  RAZORPAY: 'razorpay',
  STRIPE: 'stripe',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quauntity: number;
  quantity?: number;
}

export interface DeliveryAddressInfo {
  fromattedAddress: string;
  formattedAddress?: string;
  mobile: number;
  latitude: number;
  longitude: number;
}

export class OrderEntity {
  id: string;
  orderNumber?: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string | null;
  riderPhone?: number | null;
  riderName?: string | null;
  distance: number;
  riderAmount: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  addressId: string;
  deliveryAddress: DeliveryAddressInfo;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  reason?: string;
  expiresAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial?: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
