import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { RequestContext } from '../../common/context/request-context';
import type {
  GetOrderForPaymentResponse,
  OrderGrpcClient,
} from './interfaces/order-grpc.interface';

@Injectable()
export class OrderGrpcService implements OnModuleInit {
  private readonly logger = new Logger(OrderGrpcService.name);
  private orderGrpcClient!: OrderGrpcClient;

  constructor(
    @Inject('ORDER_GRPC_PACKAGE')
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.orderGrpcClient =
      this.grpcClient.getService<OrderGrpcClient>('OrderService');
  }

  async getOrderForPayment(
    orderId: string,
  ): Promise<GetOrderForPaymentResponse> {
    const metadata = new Metadata();
    const correlationId = RequestContext.getCorrelationId();
    if (correlationId) {
      metadata.add('x-correlation-id', correlationId);
    }

    this.logger.log(`[gRPC] Querying order ${orderId} from Seller service`);
    return firstValueFrom(
      this.orderGrpcClient.getOrderForPayment({ orderId }, metadata),
    );
  }
}
