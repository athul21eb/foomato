import { Injectable, Logger } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';

@Injectable()
export class RealtimeService {
  private readonly logger = new Logger(RealtimeService.name);

  constructor(private readonly gateway: RealtimeGateway) {}

  private parsePayload(payloadJson?: string): unknown {
    if (!payloadJson) {
      return {};
    }
    try {
      return JSON.parse(payloadJson);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Failed to parse payloadJson: ${message}. Using raw string.`);
      return { raw: payloadJson };
    }
  }

  emitToRoom(room: string, event: string, payloadJson?: string): boolean {
    const payload = this.parsePayload(payloadJson);
    return this.gateway.emitToRoom(room, event, payload);
  }

  emitToUser(userId: string, event: string, payloadJson?: string): boolean {
    const payload = this.parsePayload(payloadJson);
    return this.gateway.emitToUser(userId, event, payload);
  }

  emitToSeller(sellerId: string, event: string, payloadJson?: string): boolean {
    const payload = this.parsePayload(payloadJson);
    return this.gateway.emitToSeller(sellerId, event, payload);
  }

  emitToRider(riderId: string, event: string, payloadJson?: string): boolean {
    const payload = this.parsePayload(payloadJson);
    return this.gateway.emitToRider(riderId, event, payload);
  }

  broadcast(event: string, payloadJson?: string): boolean {
    const payload = this.parsePayload(payloadJson);
    return this.gateway.broadcast(event, payload);
  }
}
