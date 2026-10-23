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
        (decoded.sub as string | undefined) ||
        (decoded._id as string | undefined) ||
        (decoded.id as string | undefined) ||
        (decoded.user?._id as string | undefined) ||
        (decoded.user?.id as string | undefined);

      if (!userId) {
        this.logger.warn(
          `Unauthorized socket connection attempt from ${client.id}: Token missing user ID`,
        );
        client.disconnect();
        return;
      }

      const sellerId =
        (client.handshake.auth?.sellerId as string | undefined) ||
        (client.handshake.auth?.restaurantId as string | undefined) ||
        (decoded.sellerId as string | undefined) ||
        (decoded.restaurantId as string | undefined) ||
        (decoded.user?.restaurantId as string | undefined);

      const role =
        (decoded.role as string | undefined) ||
        (decoded.user?.role as string | undefined);

      client.data.user = {
        userId,
        sellerId,
        role,
        raw: decoded,
      };

      // Auto-join private identity rooms
      const userRoom = `user:${userId}`;
      void client.join(userRoom);

      if (sellerId && role === "seller") {
        void client.join(`seller:${sellerId}`);
      }

      this.logger.log(
        `Client connected [${client.id}] for user: ${userId} (rooms: ${Array.from(client.rooms).join(", ")})`,
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
      `Client disconnected [${client.id}] (user: ${user?.userId || "anonymous"})`,
    );
  }

  @SubscribeMessage("join:seller")
  handleJoinSeller(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sellerId?: string; restaurantId?: string },
  ): void {
    const id = data?.sellerId || data?.restaurantId;
    if (id) {
      void client.join(`seller:${id}`);
      void client.join(`restaurant:${id}`);
      this.logger.log(`Client [${client.id}] joined seller rooms for: ${id}`);
    }
  }

  @SubscribeMessage("join:room")
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room?: string },
  ): void {
    if (data?.room) {
      void client.join(data.room);
      this.logger.log(`Client [${client.id}] joined room: ${data.room}`);
    }
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

  broadcast(event: string, payload: unknown): boolean {
    this.logger.log(`[Socket.IO] Broadcasting event "${event}" to all clients`);
    this.server.emit(event, payload ?? {});
    return true;
  }
}
