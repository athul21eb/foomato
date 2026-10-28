import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { JwtService, DecodedUser } from "../../lib/jwt/jwt.service";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwtService: JwtService) {}

  afterInit(): void {
    this.logger.log("Socket.IO Gateway initialized");
  }

  handleConnection(client: Socket): void {
    try {
      const rawToken =
        (client.handshake.auth?.token as string | undefined) ||
        (client.handshake.headers?.authorization as string | undefined);

      const token =
        rawToken?.startsWith("Bearer ") ?
          rawToken.slice(7).trim()
        : rawToken?.trim();

      if (!token) {
        this.logger.warn(
          `Unauthorized socket connection attempt from ${client.id}: Missing token`,
        );
        client.disconnect();
        return;
      }

      const decoded: DecodedUser = this.jwtService.verifyToken(token);

      const userId =
        decoded.sub || ((decoded as Record<string, unknown>).id as string);

      if (!userId) {
        this.logger.warn(
          `Unauthorized socket connection attempt from ${client.id}: Token missing subject (sub)`,
        );
        client.disconnect();
        return;
      }

      const role = decoded.role || null;

      // Extract seller/restaurant ID (from token claims or authenticated handshake)
      const candidateSellerId =
        decoded.sellerId ||
        decoded.restaurantId ||
        (client.handshake.auth?.sellerId as string | undefined);

      // Authorization guard: Only users with 'seller' role may bind to seller notification rooms
      const sellerId = role === 'seller' ? candidateSellerId : undefined;

      // Extract rider ID (from token claims or authenticated handshake)
      const candidateRiderId =
        decoded.riderId ||
        (client.handshake.auth?.riderId as string | undefined);

      // Authorization guard: Only users with 'rider' role may bind to rider notification rooms
      const riderId = role === 'rider' ? candidateRiderId : undefined;

      client.data.user = {
        userId,
        sellerId,
        riderId,
        role,
        raw: decoded,
      };

      // Auto-join private user identity room
      void client.join(`user:${userId}`);

      // Auto-join seller rooms if authorized
      if (sellerId) {
        void client.join(`seller:${sellerId}`);
        void client.join(`restaurant:${sellerId}`);
      }

      // Auto-join rider room if authorized
      if (riderId) {
        void client.join(`rider:${riderId}`);
      }

      this.logger.log(
        `Client connected [${client.id}] for user: ${userId} (role: ${role || 'none'}, rooms: ${Array.from(client.rooms).join(', ')})`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Socket auth handshake failed for client ${client.id}: ${message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const user = client.data?.user as { userId?: string } | undefined;
    this.logger.log(
      `Client disconnected [${client.id}] (user: ${user?.userId || 'anonymous'})`,
    );
  }

  @SubscribeMessage('join:seller')
  handleJoinSeller(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sellerId?: string },
  ): void {
    const user = client.data?.user as
      | { role?: string; sellerId?: string }
      | undefined;

    // Security guard: Non-sellers cannot subscribe to seller order streams
    if (user?.role !== 'seller') {
      this.logger.warn(
        `Blocked unauthorized "join:seller" from client [${client.id}] with role "${user?.role || 'anonymous'}"`,
      );
      return;
    }

    const id = data?.sellerId || user.sellerId;
    if (id) {
      void client.join(`seller:${id}`);
      void client.join(`restaurant:${id}`);
      this.logger.log(
        `Seller client [${client.id}] joined rooms: seller:${id}, restaurant:${id}`,
      );
    }
  }

  @SubscribeMessage('join:rider')
  handleJoinRider(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { riderId?: string },
  ): void {
    const user = client.data?.user as
      | { role?: string; riderId?: string }
      | undefined;

    // Security guard: Non-riders cannot subscribe to rider dispatch streams
    if (user?.role !== 'rider') {
      this.logger.warn(
        `Blocked unauthorized "join:rider" from client [${client.id}] with role "${user?.role || 'anonymous'}"`,
      );
      return;
    }

    const id = data?.riderId || user.riderId;
    if (id) {
      void client.join(`rider:${id}`);
      this.logger.log(`Rider client [${client.id}] joined room: rider:${id}`);
    }
  }

  @SubscribeMessage('join:room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room?: string },
  ): void {
    const room = data?.room?.trim();
    if (!room) return;

    // Security boundary: Disallow joining private identity rooms via generic join:room
    if (
      room.startsWith('user:') ||
      room.startsWith('seller:') ||
      room.startsWith('restaurant:') ||
      room.startsWith('rider:')
    ) {
      this.logger.warn(
        `Blocked client [${client.id}] from joining restricted identity room "${room}"`,
      );
      return;
    }

    void client.join(room);
    this.logger.log(`Client [${client.id}] joined room: ${room}`);
  }

  emitToRoom(room: string, event: string, payload: unknown): boolean {
    this.logger.log(`[Socket.IO] Emitting event "${event}" to room "${room}"`);
    this.server.to(room).emit(event, payload ?? {});
    return true;
  }

  emitToUser(userId: string, event: string, payload: unknown): boolean {
    const room = `user:${userId}`;
    this.logger.log(
      `[Socket.IO] Emitting event "${event}" to user room "${room}"`,
    );
    this.server.to(room).emit(event, payload ?? {});
    return true;
  }

  emitToSeller(sellerId: string, event: string, payload: unknown): boolean {
    this.logger.log(
      `[Socket.IO] Emitting event "${event}" to seller rooms: "${sellerId}"`,
    );
    this.server.to(`seller:${sellerId}`).emit(event, payload ?? {});
    return true;
  }

  emitToRider(riderId: string, event: string, payload: unknown): boolean {
    this.logger.log(
      `[Socket.IO] Emitting event "${event}" to rider "${riderId}"`,
    );
    this.server
      .to(`rider:${riderId}`)
      .to(`user:${riderId}`)
      .emit(event, payload ?? {});
    return true;
  }

  broadcast(event: string, payload: unknown): boolean {
    this.logger.log(`[Socket.IO] Broadcasting event "${event}" to all clients`);
    this.server.emit(event, payload ?? {});
    return true;
  }
}
