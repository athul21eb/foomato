import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation';
import { JwtModule } from './lib/jwt/jwt.module';
import { RealtimeModule } from './module/realtime/realtime.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    JwtModule,
    RealtimeModule,
  ],
})
export class AppModule {}
