import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
  /**
   * Base64 or Data URI string buffer
   */
  @IsOptional()
  @IsString()
  buffer?: string;

  /**
   * Target folder on Cloudinary (defaults to 'foomato')
   */
  @IsOptional()
  @IsString()
  folder?: string;
}
