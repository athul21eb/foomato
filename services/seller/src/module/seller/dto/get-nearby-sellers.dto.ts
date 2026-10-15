import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetNearbySellersDto {
  @Type(() => Number)
  @IsNumber({}, { message: 'Latitude must be a valid number' })
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  latitude: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'Longitude must be a valid number' })
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  longitude: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Radius must be a number' })
  @Min(0, { message: 'Radius cannot be negative' })
  radius?: number = 5000;

  @IsOptional()
  @IsString()
  search?: string = '';
}
