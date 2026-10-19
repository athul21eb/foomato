import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { AddressLocationDto } from './create-address.dto';

export class UpdateAddressDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  mobile?: number;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  formattedAddress?: string;

  @ValidateNested()
  @IsOptional()
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
  location?: AddressLocationDto;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
