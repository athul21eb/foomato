import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadImageDto } from './dto/upload-image.dto';
import { ResponseMessage } from '../../common/decorators/response-message.decorator';

@Controller(['upload', 'api/upload'])
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ResponseMessage('Image uploaded successfully')
  async uploadFile(
    @UploadedFile() file?: Express.Multer.File,
    @Body() dto?: UploadImageDto,
  ) {
    return this.uploadService.handleUpload(file, dto);
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  @ResponseMessage('Image uploaded successfully')
  async uploadImageField(
    @UploadedFile() file?: Express.Multer.File,
    @Body() dto?: UploadImageDto,
  ) {
    return this.uploadService.handleUpload(file, dto);
  }
}
