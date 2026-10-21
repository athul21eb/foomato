import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './lib/cloudinary/cloudinary.module';
import { RabbitmqModule } from './lib/rabbitmq/rabbitmq.module';
import { RazorpayModule } from './lib/razorpay/razorpay.module';
import { UploadModule } from './module/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CloudinaryModule,
    RabbitmqModule,
    RazorpayModule,
    UploadModule,
  ],
})
export class AppModule {}
