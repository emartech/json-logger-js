import { Logger } from '../logger/logger';
import { merge } from 'lodash';

export class Timer {
  private readonly start: number;
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.start = new Date().getTime();
  }

  trace(action: string, data: unknown = {}) {
    this.logger.trace(action, this.getData(data));
  }

  debug(action: string, data: unknown = {}) {
    this.logger.debug(action, this.getData(data));
  }

  info(action: string, data: unknown = {}) {
    this.logger.info(action, this.getData(data));
  }

  warn(action: string, data: unknown = {}) {
    this.logger.warn(action, this.getData(data));
  }

  error(action: string, data: unknown = {}) {
    this.logger.error(action, this.getData(data));
  }

  fatal(action: string, data: unknown = {}) {
    this.logger.fatal(action, this.getData(data));
  }

  fromError(action: string, error: unknown, data: unknown = {}) {
    this.logger.fromError(action, error, this.getData(data));
  }

  warnFromError(action: string, error: unknown, data: unknown = {}) {
    this.logger.warnFromError(action, error, this.getData(data));
  }

  private getData(data: unknown): Record<string, any> {
    if (Logger.config.outputFormat === 'legacy') {
      return Object.assign({ duration: this.duration() }, data);
    }

    return merge({ event: { duration: this.duration() } }, data);
  }

  private duration(): number {
    const end = new Date().getTime();

    return end - this.start;
  }
}
