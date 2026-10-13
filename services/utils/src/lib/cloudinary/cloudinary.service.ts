import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    this.logger.log('Cloudinary configuration initialized');
  }

  /**
   * Upload a data URI string directly to Cloudinary
   */
  async uploadDataUri(
    dataUri: string,
    folder = 'foomato',
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    try {
      const response = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'auto',
        ...options,
      });
      return response;
    } catch (error) {
      this.logger.error('Failed to upload data URI to Cloudinary', error);
      throw new InternalServerErrorException(
        'Failed to upload image to Cloudinary',
      );
    }
  }

  /**
   * Upload a raw Buffer via stream to Cloudinary
   */
  async uploadBuffer(
    buffer: Buffer,
    folder = 'foomato',
    options?: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          ...options,
        },
        (error, result) => {
          if (error || !result) {
            this.logger.error('Failed to stream buffer to Cloudinary', error);
            return reject(
              new InternalServerErrorException(
                'Failed to upload image stream to Cloudinary',
              ),
            );
          }
          resolve(result);
        },
      );

      uploadStream.end(buffer);
    });
  }
}
