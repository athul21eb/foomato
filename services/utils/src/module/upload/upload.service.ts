import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CloudinaryService } from '../../lib/cloudinary/cloudinary.service';
import { getBuffer } from '../../common/utils/get-buffer.util';
import { UploadImageDto } from './dto/upload-image.dto';

export interface UploadResult {
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async handleUpload(
    file?: Express.Multer.File,
    dto?: UploadImageDto,
  ): Promise<UploadResult> {
    const rawFolder = dto?.folder?.trim();
    const folder = rawFolder ? rawFolder.replace(/^\/+|\/+$/g, '') : 'foomato';

    // 1. If multipart file is uploaded via Multer
    if (file) {
      const fileDataUri = getBuffer(file);
      if (!fileDataUri.content) {
        throw new BadRequestException(
          'Failed to format file buffer into DataURI',
        );
      }

      const result = await this.cloudinaryService.uploadDataUri(
        fileDataUri.content,
        folder,
      );

      this.logger.log(
        `File upload succeeded in folder "${folder}": ${result.secure_url} (${result.public_id})`,
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    }

    // 2. If base64/data URI buffer is passed via JSON body
    if (dto?.buffer) {
      const dataUriString = dto.buffer.startsWith('data:')
        ? dto.buffer
        : `data:image/jpeg;base64,${dto.buffer}`;

      const result = await this.cloudinaryService.uploadDataUri(
        dataUriString,
        folder,
      );

      this.logger.log(
        `Buffer upload succeeded in folder "${folder}": ${result.secure_url} (${result.public_id})`,
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    }

    throw new BadRequestException(
      'No file or image buffer provided. Please attach a file or provide a buffer string.',
    );
  }
}
