import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { RequestContext } from '../context/request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const { method, originalUrl, ip } = req;
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();
    res.setHeader('x-correlation-id', correlationId);

    const startTime = Date.now();

    return new Observable((subscriber) => {
      RequestContext.run({ correlationId }, () => {
        next
          .handle()
          .pipe(
            tap({
              next: () => {
                const duration = Date.now() - startTime;
                const statusCode = res.statusCode;
                this.logger.log(
                  `${method} ${originalUrl} ${statusCode} +${duration}ms - IP: ${ip || 'unknown'}`,
                );
              },
              error: (err: unknown) => {
                const duration = Date.now() - startTime;
                const status =
                  typeof err === 'object' && err !== null && 'status' in err
                    ? (err as { status: number }).status
                    : 500;
                const message =
                  err instanceof Error ? err.message : 'Unknown exception';
                this.logger.error(
                  `${method} ${originalUrl} ${status} +${duration}ms - Error: ${message}`,
                );
              },
            }),
          )
          .subscribe(subscriber);
      });
    });
  }
}
