import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { RealtimeService } from './realtime.service';
import { EmitToRoomDto } from './dto/emit-to-room.dto';
import { EmitToUserDto } from './dto/emit-to-user.dto';
import { EmitToSellerDto } from './dto/emit-to-seller.dto';
import type { EmitResponse } from './interfaces/realtime.interface';

@Controller()
export class RealtimeController {
  private readonly logger = new Logger(RealtimeController.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  @GrpcMethod('RealtimeService', 'EmitToRoom')
  emitToRoom(data: EmitToRoomDto): EmitResponse {
    try {
      this.logger.log(
        `[gRPC] EmitToRoom received - Event: "${data.event}", Room: "${data.room}"`,
      );

      const success = this.realtimeService.emitToRoom(
        data.room,
        data.event,
        data.payloadJson,
      );

      return { success };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[gRPC] EmitToRoom failed for room "${data.room}": ${message}`,
      );
      throw new RpcException(message);
    }
  }

  @GrpcMethod('RealtimeService', 'EmitToUser')
  emitToUser(data: EmitToUserDto): EmitResponse {
    try {
      this.logger.log(
        `[gRPC] EmitToUser received - Event: "${data.event}", User: "${data.userId}"`,
      );

      const success = this.realtimeService.emitToUser(
        data.userId,
        data.event,
        data.payloadJson,
      );

      return { success };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[gRPC] EmitToUser failed for user "${data.userId}": ${message}`,
      );
      throw new RpcException(message);
    }
  }

  @GrpcMethod('RealtimeService', 'EmitToSeller')
  emitToSeller(data: EmitToSellerDto): EmitResponse {
    try {
      this.logger.log(
        `[gRPC] EmitToSeller received - Event: "${data.event}", Seller: "${data.sellerId}"`,
      );

      const success = this.realtimeService.emitToSeller(
        data.sellerId,
        data.event,
        data.payloadJson,
      );

      return { success };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[gRPC] EmitToSeller failed for seller "${data.sellerId}": ${message}`,
      );
      throw new RpcException(message);
    }
  }
}
