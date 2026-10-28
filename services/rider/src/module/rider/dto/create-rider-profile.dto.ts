import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateRiderProfileDto {
  @IsNotEmpty({ message: 'Rider name is required' })
  @IsString()
  riderName: string;

  @IsNotEmpty({ message: 'Picture URL is required' })
  @IsString()
  picture: string;

  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  phoneNumber: string;

  @IsNotEmpty({ message: 'Aadhar number is required' })
  @IsString()
  aadharNumber: string;

  @IsNotEmpty({ message: 'Driving license number is required' })
  @IsString()
  drivingLicenseNumber: string;

  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  longitude: number;

  @IsOptional()
  @IsString()
  formattedAddress?: string;
}
