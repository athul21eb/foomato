import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { CloudinaryModule } from './lib/cloudinary/cloudinary.module';
import { RabbitmqModule } from './lib/rabbitmq/rabbitmq.module';
import { RazorpayModule } from './lib/razorpay/razorpay.module';
import { StripeModule } from './lib/stripe/stripe.module';
import { OrderGrpcModule } from './lib/order-grpc/order-grpc.module';
import { UploadModule } from './module/upload/upload.module';
import { PaymentModule } from './module/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    CloudinaryModule,
    RabbitmqModule,
    RazorpayModule,
    StripeModule,
    OrderGrpcModule,
    UploadModule,
    PaymentModule,
  ],
})
export class AppModule {}
