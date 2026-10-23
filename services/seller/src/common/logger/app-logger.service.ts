import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { RequestContext } from '../context/request-context';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger {
  constructor(context?: string) {
    super(context || 'App', {
      json: process.env.NODE_ENV === 'production',
      colors: process.env.NODE_ENV !== 'production',
    });
  }

  protected override formatContext(context: string): string {
    const correlationId = RequestContext.getCorrelationId();
    const traceTag = correlationId ? `[${correlationId.slice(0, 8)}] ` : '';
    return `${traceTag}${super.formatContext(context)}`;
  }

  protected override getJsonLogObject(
    message: unknown,
    options: {
      context: string;
      logLevel: any;
      writeStreamType?: 'stdout' | 'stderr';
      errorStack?: unknown;
    },
  ) {
    const json = super.getJsonLogObject(message, options);
    const correlationId = RequestContext.getCorrelationId();
    const userId = RequestContext.getUserId();
    return {
      ...json,
      ...(correlationId ? { correlationId } : {}),
      ...(userId ? { userId } : {}),
    };
  }
}
