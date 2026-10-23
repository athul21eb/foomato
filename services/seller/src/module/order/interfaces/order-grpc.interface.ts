export interface GetOrderForPaymentRequest {
  orderId: string;
}

export interface GetOrderForPaymentResponse {
  orderId: string;
  amount: number;
  currency: string;
  paymentStatus: string;
}
