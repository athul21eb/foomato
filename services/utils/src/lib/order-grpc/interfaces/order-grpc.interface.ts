import { Observable } from 'rxjs';
import type { Metadata } from '@grpc/grpc-js';

export interface GetOrderForPaymentRequest {
  orderId: string;
}

export interface GetOrderForPaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
}

export interface OrderGrpcClient {
  getOrderForPayment(
    data: GetOrderForPaymentRequest,
    metadata?: Metadata,
  ): Observable<GetOrderForPaymentResponse>;
}
