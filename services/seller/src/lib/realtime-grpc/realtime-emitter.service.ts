import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { RequestContext } from '../../common/context/request-context';
import type { RealtimeGrpcService } from './interfaces/realtime-grpc.interface';

@Injectable()
export class RealtimeEmitterService implements OnModuleInit {
  private readonly logger = new Logger(RealtimeEmitterService.name);
  private realtimeGrpcService!: RealtimeGrpcService;

  constructor(
    @Inject('REALTIME_GRPC_PACKAGE')
    private readonly grpcClient: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.realtimeGrpcService =
      this.grpcClient.getService<RealtimeGrpcService>('RealtimeService');
  }

  private buildMetadata(): Metadata {
    const metadata = new Metadata();
    const correlationId = RequestContext.getCorrelationId();
    if (correlationId) {
      metadata.set('x-correlation-id', correlationId);
    }
    return metadata;
  }

  /**
   * Emit an event to any room (e.g. `restaurant:${id}`, `user:${id}`, `order:${id}`)
   */
  async emit(
    room: string,
    event: string,
    payload: unknown = {},
  ): Promise<boolean> {
    try {
      const payloadJson = JSON.stringify(payload ?? {});
      const res = await firstValueFrom(
        this.realtimeGrpcService.emitToRoom(
          { room, event, payloadJson },
          this.buildMetadata(),
        ),
      );
      return res?.success ?? true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to emit event "${event}" to room "${room}": ${message}`,
      );
      return false;
    }
  }

  /**
   * Convenience helper to emit to a specific user
   */
  async emitToUser(
    userId: string,
    event: string,
    payload: unknown = {},
  ): Promise<boolean> {
    return this.emit(`user:${userId}`, event, payload);
  }

  /**
   * Convenience helper to emit to a specific seller via gRPC
   */
  async emitToSeller(
    sellerId: string,
    event: string,
    payload: unknown = {},
  ): Promise<boolean> {
    try {
      const payloadJson = JSON.stringify(payload ?? {});
      const res = await firstValueFrom(
        this.realtimeGrpcService.emitToSeller(
          { sellerId, event, payloadJson },
          this.buildMetadata(),
        ),
      );
      return res?.success ?? true;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to emit event "${event}" to seller "${sellerId}": ${message}`,
      );
      return false;
    }
  }
}
