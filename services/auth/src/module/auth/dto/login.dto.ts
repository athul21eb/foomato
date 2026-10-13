import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Trim } from '../../../common/decorators/trim.decorator';

export class LoginDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Trim()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  picture?: string;

  @IsString()
  @IsOptional()
  image?: string;
}
