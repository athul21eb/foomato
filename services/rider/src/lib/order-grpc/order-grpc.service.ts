import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { RequestContext } from '../../common/context/request-context';
import type {
  AssignRiderRequest,
  AssignRiderResponse,
  OrderGrpcClient,
  RiderOrderDetailsResponse,
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

  private buildMetadata(): Metadata {
    const metadata = new Metadata();
    const correlationId = RequestContext.getCorrelationId();
    if (correlationId) {
      metadata.add('x-correlation-id', correlationId);
    }
    return metadata;
  }

  async assignRider(data: AssignRiderRequest): Promise<AssignRiderResponse> {
    this.logger.log(
      `[gRPC] Invoking AssignRider on Seller service for order ${data.orderId} (rider: ${data.riderId})`,
    );
    return firstValueFrom(
      this.orderGrpcClient.assignRider(data, this.buildMetadata()),
    );
  }

  async getCurrentRiderOrder(
    riderId: string,
  ): Promise<RiderOrderDetailsResponse> {
    this.logger.log(
      `[gRPC] Invoking GetCurrentRiderOrder on Seller service for rider ${riderId}`,
    );
    return firstValueFrom(
      this.orderGrpcClient.getCurrentRiderOrder(
        { riderId },
        this.buildMetadata(),
      ),
    );
  }

  async updateOrderStatusByRider(
    orderId: string,
    riderId: string,
  ): Promise<RiderOrderDetailsResponse> {
    this.logger.log(
      `[gRPC] Invoking UpdateOrderStatusByRider on Seller service for order ${orderId} (rider: ${riderId})`,
    );
    return firstValueFrom(
      this.orderGrpcClient.updateOrderStatusByRider(
        { orderId, riderId },
        this.buildMetadata(),
      ),
    );
  }

  async getRiderPastOrders(
    riderId: string,
  ): Promise<import('./interfaces/order-grpc.interface').GetRiderPastOrdersResponse> {
    this.logger.log(
      `[gRPC] Invoking GetRiderPastOrders on Seller service for rider ${riderId}`,
    );
    return firstValueFrom(
      this.orderGrpcClient.getRiderPastOrders(
        { riderId },
        this.buildMetadata(),
      ),
    );
  }
}
