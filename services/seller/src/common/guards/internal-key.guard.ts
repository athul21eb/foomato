import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class InternalKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const internalKey = request.headers['x-internal-key'];
    const expectedKey =
      this.configService.get<string>('INTERNAL_SERVICE_KEY') ||
      process.env.INTERNAL_SERVICE_KEY;

    if (!internalKey || (expectedKey && internalKey !== expectedKey)) {
      throw new ForbiddenException('Forbidden: Invalid internal service key');
    }

    return true;
  }
}
