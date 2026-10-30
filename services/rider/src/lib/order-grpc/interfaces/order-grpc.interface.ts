import { Observable } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

export interface AssignRiderRequest {
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

export interface GetCurrentRiderOrderRequest {
  riderId: string;
}

export interface UpdateOrderStatusByRiderRequest {
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

export interface GetRiderPastOrdersRequest {
  riderId: string;
}

export interface GetRiderPastOrdersResponse {
  orders: RiderOrderDetailsResponse[];
  total: number;
  totalEarnings: number;
}

export interface OrderGrpcClient {
  assignRider(
    data: AssignRiderRequest,
    metadata?: Metadata,
  ): Observable<AssignRiderResponse>;
  getCurrentRiderOrder(
    data: GetCurrentRiderOrderRequest,
    metadata?: Metadata,
  ): Observable<RiderOrderDetailsResponse>;
  updateOrderStatusByRider(
    data: UpdateOrderStatusByRiderRequest,
    metadata?: Metadata,
  ): Observable<RiderOrderDetailsResponse>;
  getRiderPastOrders(
    data: GetRiderPastOrdersRequest,
    metadata?: Metadata,
  ): Observable<GetRiderPastOrdersResponse>;
}
