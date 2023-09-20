import { config } from '../config';
const STACK_TRACE_LIMIT = 3000;
const DATA_LIMIT = 3000;
import { Timer } from '../timer/timer';
import { jsonFormatter } from '../formatter/json';
import { consoleOutput } from '../output/console';
import { merge } from 'lodash';
const allowedKeys = ['output', 'formatter', 'transformers', 'outputFormat'];

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
  outputFormat: String;
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
        throw new Error('Only the following keys are allowed: ' + allowedKeys);
      }
    });
  }

  static config: LoggerConfig = {
    formatter: jsonFormatter,
    output: consoleOutput,
    transformers: [],
    outputFormat: 'ecs',
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
    this.log(severity, action, merge(this.getErrorDetails(error), data));
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

    let dataToLog = merge(this.getBaseLogFields(level, action), data);

    Logger.config.transformers.forEach((transform) => {
      dataToLog = transform(dataToLog);
    });

    Logger.config.output(Logger.config.formatter(dataToLog));
  }

  private getBaseLogFields(level: string, action: string) {
    if (Logger.config.outputFormat === 'legacy') {
      return {
        name: this.namespace,
        action: action,
        level: config.levels[level].number,
        time: new Date().toISOString(),
      };
    }

    return {
      event: {
        action: action,
        created: new Date().toISOString(),
      },
      log: {
        logger: this.namespace,
        level: config.levels[level].number,
      },
    };
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

    return merge(this.getBaseErrorDetails(error), this.getAxiosErrorDetails(error as AxiosError));
  }

  private getBaseErrorDetails(error: Error) {
    if (Logger.config.outputFormat === 'legacy') {
      return {
        error_name: error.name,
        error_stack: this.shortenStackTrace(error.stack || ''),
        error_message: error.message,
        error_data: this.shortenData((error as ErrorWithData).data),
      };
    }

    return {
      error: {
        type: error.name,
        message: error.message,
        context: this.shortenData((error as ErrorWithData).data),
        stack_trace: this.shortenStackTrace(error.stack || ''),
      },
    };
  }

  private getAxiosErrorDetails(error: AxiosError) {
    if (!error.isAxiosError) {
      return {};
    }

    if (Logger.config.outputFormat === 'legacy') {
      return {
        request_method: error.config.method,
        request_url: error.config.url,
        response_status: error.response ? error.response.status : undefined,
        response_status_text: error.response ? error.response.statusText : undefined,
        response_data: error.response ? this.shortenData(error.response.data) : undefined,
      };
    }

    return {
      url: {
        full: error.config.url,
      },
      http: {
        request: {
          method: error.config.method,
        },
        response: {
          status_code: error.response ? error.response.status : undefined,
          body: {
            content: error.response ? this.shortenData(error.response.data) : undefined,
          },
        },
      },
    };
  }
}
