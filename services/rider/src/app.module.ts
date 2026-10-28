import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './lib/database/database.module';
import { JwtModule } from './lib/jwt/jwt.module';
import { RabbitmqModule } from './lib/rabbitmq/rabbitmq.module';
import { RealtimeModule } from './lib/realtime-grpc/realtime.module';
import { OrderGrpcModule } from './lib/order-grpc/order-grpc.module';
import { RiderModule } from './module/rider/rider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    JwtModule,
    RabbitmqModule,
    RealtimeModule,
    OrderGrpcModule,
    RiderModule,
  ],
})
export class AppModule {}
