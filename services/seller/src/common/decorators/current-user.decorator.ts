import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface CurrentUserPayload {
  id?: string;
  sub?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

interface RequestWithUser extends Request {
  user?: CurrentUserPayload;
}

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return null;
    }

    if (data === 'id') {
      return user.id ?? user.sub;
    }

    return data ? user[data] : user;
  },
);
