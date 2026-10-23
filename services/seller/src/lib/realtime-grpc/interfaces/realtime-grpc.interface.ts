import { Observable } from 'rxjs';

export interface EmitToRoomRequest {
  room: string;
  event: string;
  payloadJson: string;
}

export interface EmitToUserRequest {
  userId: string;
  event: string;
  payloadJson: string;
}

export interface EmitToSellerRequest {
  sellerId: string;
  event: string;
  payloadJson: string;
}

export interface EmitResponse {
  success: boolean;
}

export interface RealtimeGrpcService {
  emitToRoom(data: EmitToRoomRequest, metadata?: any): Observable<EmitResponse>;
  emitToUser(data: EmitToUserRequest, metadata?: any): Observable<EmitResponse>;
  emitToSeller(
    data: EmitToSellerRequest,
    metadata?: any,
  ): Observable<EmitResponse>;
}
