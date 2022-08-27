import { config } from '../config';
const STACK_TRACE_LIMIT = 3000;
const DATA_LIMIT = 3000;
import { Timer } from '../timer/timer';
import { jsonFormatter } from '../formatter/json';
import { consoleOutput } from '../output/console';
const allowedKeys = ['output', 'formatter', 'transformers'];

interface ErrorWithData extends Error {
  data: unknown;
}

interface AxiosError extends Error {
  isAxiosError: boolean;
  config: {
    method: string;
    url: string;
  },
  response?: {
    status: number;
    statusText: string;
    data: string;
  }
}

export interface LoggerConfig {
  formatter: Function;
  output: Function;
  transformers: Function[];
}

export class Logger {
  _namespace: string;
  _enabled: boolean;

  constructor(namespace: string, enabled: boolean) {
    this._namespace = namespace;
    this._enabled = enabled;
  }

  static configure(options: LoggerConfig) {
    this._validate(options);
    Object.assign(Logger.config, options);
  }

  static _validate(options: LoggerConfig) {
    Object.keys(options).forEach(key => {
      if (!allowedKeys.includes(key)) {
        throw new Error('Only the following keys are allowed: formatter, output');
      }
    });
  }

  static config: LoggerConfig = {
    formatter: jsonFormatter,
    output: consoleOutput,
    transformers: []
  }

  isEnabled() {
    return this._enabled;
  }

  trace(action: string, data: unknown = {}) {
    this._log('trace', action, data);
  }

  debug(action: string, data: unknown = {}) {
    this._log('debug', action, data);
  }

  info(action: string, data: unknown = {}) {
    this._log('info', action, data);
  }

  warn(action: string, data: unknown = {}) {
    this._log('warn', action, data);
  }

  error(action: string, data: unknown = {}) {
    this._log('error', action, data);
  }

  fatal(action: string, data: unknown = {}) {
    this._log('fatal', action, data);
  }

  _log(level: string, action: string, data: unknown) {
    if (!this._enabled) {
      return;
    }

    let dataToLog = Object.assign(
      {
        name: this._namespace,
        action: action,
        level: config.levels[level].number,
        time: new Date().toISOString()
      },
      data
    );

    Logger.config.transformers.forEach((transform) => {
      dataToLog = transform(dataToLog);
    });

    Logger.config.output(
      Logger.config.formatter(dataToLog)
    );
  }

  customError(severity: string, action: string, error: Error, data: unknown = {}) {
    this._log(severity, action, Object.assign(this._getErrorDetails(error), data));
  }

  fromError(action: string, error: unknown, data: unknown = {}) {
    this.customError('error', action, error as Error, data);
  }

  warnFromError(action: string, error: unknown, data: unknown = {}) {
    this.customError('warn', action, error as Error, data);
  }

  timer() {
    return new Timer(this);
  }

  _shortenStackTrace(stack: string) {
    if (!stack) {
      return;
    }

    return stack.length > STACK_TRACE_LIMIT ?
      stack.substring(0, STACK_TRACE_LIMIT) + ' ...' :
      stack;
  }

  _shortenData(data: unknown) {
    if (typeof data === 'undefined') {
      return;
    }

    const stringifiedData: string = typeof data === 'object' ? JSON.stringify(data) : data as string;

    return stringifiedData.length > DATA_LIMIT ?
      stringifiedData.substring(0, DATA_LIMIT) + ' ...' :
      stringifiedData;
  }

  _getErrorDetails(error: Error) {
    if (!(error instanceof Object)) {
      return {};
    }

    const baseDetails = {
      error_name: error.name,
      error_stack: this._shortenStackTrace(error.stack || ''),
      error_message: error.message,
      error_data: this._shortenData((error as ErrorWithData).data)
    };

    return Object.assign(baseDetails, this._getAxiosErrorDetails(error as AxiosError));
  }

  _getAxiosErrorDetails(error: AxiosError) {
    if (!error.isAxiosError) {
      return {};
    }

    return {
      request_method: error.config.method,
      request_url: error.config.url,
      response_status: error.response ? error.response.status : undefined,
      response_status_text: error.response ? error.response.statusText : undefined,
      response_data: error.response ? this._shortenData(error.response.data) : undefined
    };
  }
}
