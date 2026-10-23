import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EmitToUserDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  event!: string;

  @IsString()
  @IsOptional()
  payloadJson?: string;
}
