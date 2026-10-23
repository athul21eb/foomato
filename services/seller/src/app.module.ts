import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { DatabaseModule } from './lib/database/database.module';
import { JwtModule } from './lib/jwt/jwt.module';
import { RabbitmqModule } from './lib/rabbitmq/rabbitmq.module';
import { RealtimeModule } from './lib/realtime-grpc/realtime.module';
import { SellerModule } from './module/seller/seller.module';
import { MenuItemModule } from './module/menu-item/menu-item.module';
import { CartModule } from './module/cart/cart.module';
import { AddressModule } from './module/address/address.module';
import { OrderModule } from './module/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    DatabaseModule,
    JwtModule,
    RabbitmqModule,
    RealtimeModule,
    SellerModule,
    MenuItemModule,
    CartModule,
    AddressModule,
    OrderModule,
  ],
})
export class AppModule {}
