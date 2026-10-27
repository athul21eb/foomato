import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsLatitude,
  IsLongitude,
  IsNumber,
} from 'class-validator';

export class ToggleAvailabilityDto {
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable: boolean;

  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @IsLatitude({ message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @IsLongitude({ message: 'Longitude must be between -180 and 180' })
  longitude: number;
}
