import { Logger } from '../logger/logger';

export class Timer {
  _logger: Logger;
  _start: number;

  constructor(logger: Logger) {
    this._logger = logger;
    this._start = new Date().getTime();
  }

  trace(action: string, data: unknown = {}) {
    this._logger.trace(
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  debug(action: string, data: unknown = {}) {
    this._logger.debug(
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  info(action: string, data: unknown = {}) {
    this._logger.info(
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  warn(action: string, data: unknown = {}) {
    this._logger.warn(
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  error(action: string, data: unknown = {}) {
    this._logger.error(
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  fatal(action: string, data: unknown = {}) {
    this._logger.fatal(
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  fromError(action: string, error: Error, data: unknown = {}) {
    this._logger.fromError(
      action,
      error,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  warnFromError(action: string, error: Error, data: unknown = {}) {
    this._logger.warnFromError(
      action,
      error,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  _duration(): number {
    const end = new Date().getTime();

    return end - this._start;
  }
}
