import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './lib/database/database.module';
import { JwtModule } from './lib/jwt/jwt.module';
import { SellerModule } from './module/seller/seller.module';
import { MenuItemModule } from './module/menu-item/menu-item.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    JwtModule,
    SellerModule,
    MenuItemModule,
  ],
})
export class AppModule {}
