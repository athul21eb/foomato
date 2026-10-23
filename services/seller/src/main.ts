import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
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
    origin: true,
    credentials: true,
  });

  app.use(cookieParser());

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(app.get(Reflector)),
  );

  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');

  const grpcPort = configService.getOrThrow<number>('GRPC_PORT');
  const grpcHost = configService.getOrThrow<string>('GRPC_HOST');

  app.connectMicroservice<MicroserviceOptions>(
    {
      transport: Transport.GRPC,
      options: {
        package: 'order',
        protoPath: join(__dirname, 'proto', 'order.proto'),
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
    `Seller service HTTP running on port ${port}, gRPC running on ${grpcHost}:${grpcPort}`,
  );
}

bootstrap().catch((err) => {
  new Logger('Bootstrap').error('Failed to start seller service', err);
  process.exit(1);
});
