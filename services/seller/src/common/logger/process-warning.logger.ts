import { Logger } from '@nestjs/common';

/**
 * Captures Node.js and database runtime process warnings into standardized enterprise logs.
 */
export function registerProcessWarningLogger(): void {
  process.on('warning', (warning) => {
    const context = warning.name.includes('Mongoose') ? 'Mongoose' : 'Process';
    new Logger(context).warn(warning.message);
  });
}
