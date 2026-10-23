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
