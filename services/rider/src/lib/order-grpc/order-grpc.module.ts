import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { OrderGrpcService } from './order-grpc.service';

@Global()
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'ORDER_GRPC_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'order',
            protoPath: join(__dirname, '../../proto/order.proto'),
            url: configService.getOrThrow<string>('SELLER_GRPC_URL'),
          },
        }),
      },
    ]),
  ],
  providers: [OrderGrpcService],
  exports: [OrderGrpcService, ClientsModule],
})
export class OrderGrpcModule {}
