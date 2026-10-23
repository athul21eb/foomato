import { Logger } from '@nestjs/common';

/**
 * Captures Node.js and runtime process warnings into standardized enterprise logs.
 */
export function registerProcessWarningLogger(): void {
  process.on('warning', (warning) => {
    new Logger('Process').warn(warning.message);
  });
}
