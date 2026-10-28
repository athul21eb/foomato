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
}
