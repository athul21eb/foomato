import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AutoLocationDto } from './create-seller.dto';

export class UpdateSellerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  phone?: number;

  @ValidateNested()
  @IsOptional()
  @Type(() => AutoLocationDto)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as AutoLocationDto;
      } catch {
        return value;
      }
    }
    return value as AutoLocationDto;
  })
  autoLocation?: AutoLocationDto;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean;
  })
  isOpen?: boolean;
}
