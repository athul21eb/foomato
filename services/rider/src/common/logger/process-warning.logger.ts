import { Logger } from '@nestjs/common';

export function registerProcessWarningLogger(): void {
  process.on('warning', (warning) => {
    const context = warning.name.includes('Mongoose') ? 'Mongoose' : 'Process';
    new Logger(context).warn(warning.message);
  });
}
