import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { RealtimeEmitterService } from './realtime-emitter.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'REALTIME_GRPC_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'realtime',
            protoPath: join(__dirname, '../../proto/realtime.proto'),
            url:
              configService.get<string>('REALTIME_GRPC_URL') ||
              '127.0.0.1:50054',
          },
        }),
      },
    ]),
  ],
  providers: [RealtimeEmitterService],
  exports: [RealtimeEmitterService, ClientsModule],
})
export class RealtimeModule {}
