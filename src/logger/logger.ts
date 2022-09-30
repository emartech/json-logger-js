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
  };
  response?: {
    status: number;
    statusText: string;
    data: string;
  };
}

export interface LoggerConfig {
  formatter: Function;
  output: Function;
  transformers: Function[];
}

export class Logger {
  private readonly namespace: string;
  private readonly enabled: boolean;

  constructor(namespace: string, enabled: boolean) {
    this.namespace = namespace;
    this.enabled = enabled;
  }

  static configure(options: Partial<LoggerConfig>) {
    this.validate(options);
    Object.assign(Logger.config, options);
  }

  private static validate(options: Partial<LoggerConfig>) {
    Object.keys(options).forEach((key) => {
      if (!allowedKeys.includes(key)) {
        throw new Error('Only the following keys are allowed: formatter, output');
      }
    });
  }

  static config: LoggerConfig = {
    formatter: jsonFormatter,
    output: consoleOutput,
    transformers: [],
  };

  isEnabled() {
    return this.enabled;
  }

  trace(action: string, data: unknown = {}) {
    this.log('trace', action, data);
  }

  debug(action: string, data: unknown = {}) {
    this.log('debug', action, data);
  }

  info(action: string, data: unknown = {}) {
    this.log('info', action, data);
  }

  warn(action: string, data: unknown = {}) {
    this.log('warn', action, data);
  }

  error(action: string, data: unknown = {}) {
    this.log('error', action, data);
  }

  fatal(action: string, data: unknown = {}) {
    this.log('fatal', action, data);
  }

  customError(severity: string, action: string, error: Error, data: unknown = {}) {
    this.log(severity, action, Object.assign(this.getErrorDetails(error), data));
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

  private log(level: string, action: string, data: unknown) {
    if (!this.enabled) {
      return;
    }

    let dataToLog = Object.assign(
      {
        name: this.namespace,
        action: action,
        level: config.levels[level].number,
        time: new Date().toISOString(),
      },
      data,
    );

    Logger.config.transformers.forEach((transform) => {
      dataToLog = transform(dataToLog);
    });

    Logger.config.output(Logger.config.formatter(dataToLog));
  }

  private shortenStackTrace(stack: string) {
    if (!stack) {
      return;
    }

    return stack.length > STACK_TRACE_LIMIT ? stack.substring(0, STACK_TRACE_LIMIT) + ' ...' : stack;
  }

  private shortenData(data: unknown) {
    if (typeof data === 'undefined') {
      return;
    }

    const stringifiedData: string = typeof data === 'object' ? JSON.stringify(data) : (data as string);

    return stringifiedData.length > DATA_LIMIT ? stringifiedData.substring(0, DATA_LIMIT) + ' ...' : stringifiedData;
  }

  private getErrorDetails(error: Error) {
    if (!(error instanceof Object)) {
      return {};
    }

    const baseDetails = {
      error_name: error.name,
      error_stack: this.shortenStackTrace(error.stack || ''),
      error_message: error.message,
      error_data: this.shortenData((error as ErrorWithData).data),
    };

    return Object.assign(baseDetails, this.getAxiosErrorDetails(error as AxiosError));
  }

  private getAxiosErrorDetails(error: AxiosError) {
    if (!error.isAxiosError) {
      return {};
    }

    return {
      request_method: error.config.method,
      request_url: error.config.url,
      response_status: error.response ? error.response.status : undefined,
      response_status_text: error.response ? error.response.statusText : undefined,
      response_data: error.response ? this.shortenData(error.response.data) : undefined,
    };
  }
}
