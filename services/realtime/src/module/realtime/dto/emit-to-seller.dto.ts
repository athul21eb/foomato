import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmitToSellerDto {
  @IsString()
  @IsNotEmpty()
  sellerId!: string;

  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsString()
  @IsOptional()
  payloadJson?: string;
}
