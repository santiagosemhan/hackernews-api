/* eslint-disable @typescript-eslint/no-empty-function */
import { LoggerService } from '@nestjs/common';
export class EmptyLogger implements LoggerService {
  log(message: string): void {}
  error(message: string, trace: string): void {}
  warn(message: string): void {}
  debug(message: string): void {}
  verbose(message: string): void {}
}
