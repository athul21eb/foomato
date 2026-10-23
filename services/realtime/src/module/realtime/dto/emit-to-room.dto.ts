import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmitToRoomDto {
  @IsString()
  @IsNotEmpty()
  room!: string;

  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsString()
  @IsOptional()
  payloadJson?: string;
}
