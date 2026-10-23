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
import { Metadata } from '@grpc/grpc-js';
import { RequestContext } from '../context/request-context';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly httpLogger = new Logger('HTTP');
  private readonly rpcLogger = new Logger('gRPC');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
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
                  this.httpLogger.log(
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
                  this.httpLogger.error(
                    `${method} ${originalUrl} ${status} +${duration}ms - Error: ${message}`,
                  );
                },
              }),
            )
            .subscribe(subscriber);
        });
      });
    }

    if (context.getType() === 'rpc') {
      const rpcCtx = context.switchToRpc();
      const rawContext = rpcCtx.getContext<Metadata>();
      const args = context.getArgs();
      const metadata: Metadata | undefined =
        rawContext && typeof rawContext.get === 'function'
          ? rawContext
          : args[1] && typeof args[1].get === 'function'
            ? args[1]
            : args[2]?.metadata && typeof args[2].metadata.get === 'function'
              ? args[2].metadata
              : undefined;

      let correlationId: string | undefined;

      if (metadata && typeof metadata.get === 'function') {
        const values = metadata.get('x-correlation-id');
        if (values && values.length > 0) {
          correlationId = String(values[0]);
        }
      }
      if (!correlationId) {
        correlationId = randomUUID();
      }

      const handlerName = context.getHandler()?.name || 'RpcMethod';
      const className = context.getClass()?.name || 'RpcController';
      const startTime = Date.now();

      return new Observable((subscriber) => {
        RequestContext.run({ correlationId }, () => {
          next
            .handle()
            .pipe(
              tap({
                next: () => {
                  const duration = Date.now() - startTime;
                  this.rpcLogger.log(
                    `${className}.${handlerName} +${duration}ms`,
                  );
                },
                error: (err: unknown) => {
                  const duration = Date.now() - startTime;
                  const message =
                    err instanceof Error ? err.message : String(err);
                  this.rpcLogger.error(
                    `${className}.${handlerName} +${duration}ms - Error: ${message}`,
                  );
                },
              }),
            )
            .subscribe(subscriber);
        });
      });
    }

    return next.handle();
  }
}
