export type PaymentGateway = 'razorpay' | 'stripe';

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: PaymentGateway;
}

export interface CreateOrderResult {
  message: string;
  orderId: string;
  orderNumber?: string;
  amount: number;
}

export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  quantity?: number;
  quauntity?: number;
}

export interface OrderDetails {
  id: string;
  orderNumber?: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  riderId?: string | null;
  riderName?: string | null;
  riderPhone?: number | null;
  distance: number;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  totalAmount: number;
  addressId: string;
  deliveryAddress: {
    formattedAddress?: string;
    fromattedAddress?: string;
    mobile: number;
    latitude: number;
    longitude: number;
  };
  status: string;
  paymentMethod: PaymentGateway;
  paymentStatus: 'pending' | 'paid' | 'failed';
  reason?: string;
  createdAt?: string;
}

export interface SellerOrdersResponse {
  orders: OrderDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts?: Record<string, number>;
}

export interface RazorpayOrderResult {
  razorpayOrderId: string;
  amount: number;
  currency: string;
  key: string;
}

export interface VerifyRazorpayPayload {
  orderId: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface StripePayResult {
  url: string;
  sessionId: string;
}

export interface VerifyStripePayload {
  sessionId: string;
}

export interface PendingOrderSession {
  orderId: string;
  orderNumber?: string;
  createdAt: number;
  addressId: string;
  subTotal: number;
  paymentMethod: PaymentGateway;
  razorpayOrder?: RazorpayOrderResult;
}
