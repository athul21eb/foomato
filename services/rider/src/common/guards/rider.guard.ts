import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

interface RequestWithUser extends Request {
  user?: CurrentUserPayload;
}

@Injectable()
export class RiderGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (user.role !== 'rider') {
      throw new ForbiddenException('Access restricted to rider accounts only');
    }

    return true;
  }
}
