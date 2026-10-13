import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class AutoLocationDto {
  @IsEnum(['Point'])
  @IsNotEmpty()
  type: 'Point';

  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as unknown;
        if (Array.isArray(parsed)) {
          return parsed as [number, number];
        }
      } catch {
        return value;
      }
    }
    return value as [number, number];
  })
  coordinates: [number, number]; // [longitude, latitude]

  @IsString()
  @IsOptional()
  formattedAddress?: string;
}

export class CreateSellerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @Type(() => Number)
  phone: number;

  @ValidateNested()
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
  autoLocation: AutoLocationDto;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value as boolean;
  })
  isOpen?: boolean;
}
