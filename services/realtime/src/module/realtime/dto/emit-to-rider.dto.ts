import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmitToRiderDto {
  @IsString()
  @IsNotEmpty()
  riderId!: string;

  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsString()
  @IsOptional()
  payloadJson?: string;
}
