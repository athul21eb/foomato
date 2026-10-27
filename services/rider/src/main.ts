import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
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

  await app.listen(port);
  logger.log(`Rider HTTP service listening on port: ${port} (/api/v1)`);
}

void bootstrap();
