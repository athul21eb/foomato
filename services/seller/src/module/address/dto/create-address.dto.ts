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

export class AddressLocationDto {
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
}

export class CreateAddressDto {
  @IsNumber()
  @Type(() => Number)
  mobile: number;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsNotEmpty()
  formattedAddress: string;

  @ValidateNested()
  @Type(() => AddressLocationDto)
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as AddressLocationDto;
      } catch {
        return value;
      }
    }
    return value as AddressLocationDto;
  })
  location: AddressLocationDto;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
