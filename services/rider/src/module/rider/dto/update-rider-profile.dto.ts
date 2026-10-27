import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateRiderProfileDto {
  @IsOptional()
  @IsString()
  riderName?: string;

  @IsOptional()
  @IsString()
  picture?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  @IsOptional()
  @IsString()
  drivingLicenseNumber?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  longitude?: number;
}
