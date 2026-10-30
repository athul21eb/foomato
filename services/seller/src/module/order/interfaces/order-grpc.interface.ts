export interface GetOrderForPaymentRequest {
  orderId: string;
}

export interface GetOrderForPaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
}

export interface AssignRiderGrpcDto {
  orderId: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
}

export interface AssignRiderResponse {
  success: boolean;
  message: string;
  orderId: string;
  status: string;
}

export interface GetCurrentRiderOrderGrpcDto {
  riderId: string;
}

export interface UpdateOrderStatusByRiderGrpcDto {
  orderId: string;
  riderId: string;
}

export interface RiderOrderItemGrpc {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface RiderOrderDetailsResponse {
  orderId: string;
  orderNumber: string;
  restaurantId: string;
  restaurantName: string;
  status: string;
  totalAmount: number;
  riderAmount: number;
  pickupAddress: string;
  pickupLat: number;
  pickupLng: number;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  customerPhone: string;
  itemsSummary: string;
  restaurantPhone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  customerName?: string;
  items?: RiderOrderItemGrpc[];
}

export interface GetRiderPastOrdersGrpcDto {
  riderId: string;
}

export interface GetRiderPastOrdersResponse {
  orders: RiderOrderDetailsResponse[];
  total: number;
  totalEarnings: number;
}
