import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import {
  AppLoggerService,
  registerProcessWarningLogger,
} from './common/logger';

async function bootstrap() {
  const logger = new AppLoggerService('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(logger);
  registerProcessWarningLogger();

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  const grpcPort = configService.getOrThrow<number>('GRPC_PORT');
  const grpcHost = configService.getOrThrow<string>('GRPC_HOST');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'realtime',
        protoPath: join(__dirname, 'proto', 'realtime.proto'),
        url: `${grpcHost}:${grpcPort}`,
      },
    },
    {
      inheritAppConfig: true,
    },
  );

  await app.startAllMicroservices();
  await app.listen(port);

  logger.log(
    `Realtime service HTTP/WS running on port ${port}, gRPC running on ${grpcHost}:${grpcPort}`,
  );
}

bootstrap().catch((err: unknown) => {
  new Logger('Bootstrap').error('Failed to start realtime service', err);
  process.exit(1);
});
