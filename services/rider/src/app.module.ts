import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './lib/database/database.module';
import { JwtModule } from './lib/jwt/jwt.module';
import { RiderModule } from './module/rider/rider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    JwtModule,
    RiderModule,
  ],
})
export class AppModule {}
