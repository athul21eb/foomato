import { AsyncLocalStorage } from 'async_hooks';

export interface RequestStore {
  correlationId: string;
  userId?: string;
}

export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<RequestStore>();

  static run<T>(store: RequestStore, fn: () => T): T {
    return this.storage.run(store, fn);
  }

  static getStore(): RequestStore | undefined {
    return this.storage.getStore();
  }

  static getCorrelationId(): string | undefined {
    return this.storage.getStore()?.correlationId;
  }

  static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }
}
