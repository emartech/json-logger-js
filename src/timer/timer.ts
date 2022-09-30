import { Logger } from '../logger/logger';

export class Timer {
  private readonly start: number;
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.start = new Date().getTime();
  }

  trace(action: string, data: unknown = {}) {
    this.logger.trace(action, Object.assign({ duration: this.duration() }, data));
  }

  debug(action: string, data: unknown = {}) {
    this.logger.debug(action, Object.assign({ duration: this.duration() }, data));
  }

  info(action: string, data: unknown = {}) {
    this.logger.info(action, Object.assign({ duration: this.duration() }, data));
  }

  warn(action: string, data: unknown = {}) {
    this.logger.warn(action, Object.assign({ duration: this.duration() }, data));
  }

  error(action: string, data: unknown = {}) {
    this.logger.error(action, Object.assign({ duration: this.duration() }, data));
  }

  fatal(action: string, data: unknown = {}) {
    this.logger.fatal(action, Object.assign({ duration: this.duration() }, data));
  }

  fromError(action: string, error: unknown, data: unknown = {}) {
    this.logger.fromError(action, error, Object.assign({ duration: this.duration() }, data));
  }

  warnFromError(action: string, error: unknown, data: unknown = {}) {
    this.logger.warnFromError(action, error, Object.assign({ duration: this.duration() }, data));
  }

  private duration(): number {
    const end = new Date().getTime();

    return end - this.start;
  }
}
