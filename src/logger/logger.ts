import { merge } from 'lodash';
import { config } from '../config';
import { jsonFormatter } from '../formatter/json';
import { consoleOutput } from '../output/console';
import { Timer } from '../timer/timer';

const STACK_TRACE_LIMIT = 3000;
const ENHANCED_STACK_TRACE_LIMIT = 15000;
const DATA_LIMIT = 3000;
const allowedKeys = ['output', 'formatter', 'transformers', 'outputFormat', 'enhancedStackTrace'];

interface ErrorWithData extends Error {
  data: unknown;
}

interface AxiosError extends Error {
  isAxiosError: boolean;
  code?: string;
  config?: {
    method?: string;
    url?: string;
  };
  response?: {
    status: number;
    statusText: string;
    data: string;
  };
}

/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export interface LoggerConfig {
  formatter: Function;
  output: Function;
  transformers: Function[];
  outputFormat: string;
  enhancedStackTrace: boolean;
}
/* eslint-enable @typescript-eslint/no-unsafe-function-type */

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
    enhancedStackTrace: false,
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
    const shortenedData = this.shortenData((error as ErrorWithData).data);

    if (Logger.config.outputFormat === 'legacy') {
      return {
        error_name: error.name,
        error_stack: this.shortenStackTrace(error.stack || ''),
        error_message: error.message,
        error_data: shortenedData,
      };
    }

    const stackTrace = Logger.config.enhancedStackTrace
      ? this.getEnhancedStackTrace(error)
      : this.shortenStackTrace(error.stack || '');

    return {
      error: {
        type: error.name,
        message: error.message,
        ...(shortenedData && { context: shortenedData }),
        stack_trace: stackTrace,
      },
      event: {
        reason: error.message,
      },
    };
  }

  private getEnhancedStackTrace(error: Error): string {
    const getNumberOfCommonFrames = (ownTrace: string[], enclosingTrace: string[]): number => {
      let m = ownTrace.length - 1;
      let n = enclosingTrace.length - 1;

      while (m > 0 && n > 0 && ownTrace[m] === enclosingTrace[n]) {
        m--;
        n--;
      }
      return ownTrace.length - 1 - m;
    };

    const getEnclosedStackTrace = (error: Error, enclosingTrace: string[], caption: string): string[] => {
      const output: string[] = [];

      let errorName: string;
      let errorStack: string[];
      const errorStackLines = error.stack ? error.stack.split('\n') : [];
      const firstLine = errorStackLines.at(0);

      if (error.stack) {
        if (firstLine?.includes(error.name)) {
          errorName = firstLine!;
          errorStack = errorStackLines.slice(1);
        } else {
          errorName = error.name;
          errorStack = errorStackLines;
        }
      } else {
        errorName = error.name;
        errorStack = [];
      }

      const commonFrames = getNumberOfCommonFrames(errorStack, enclosingTrace);
      const uniqueFrames = errorStack.length - commonFrames;

      output.push(caption + errorName);
      errorStack.slice(0, uniqueFrames).forEach((line) => output.push(line));
      if (commonFrames > 0) {
        output.push(`\t... ${commonFrames} more`);
      }

      if (error.cause instanceof Error) {
        output.push(...getEnclosedStackTrace(error.cause, errorStackLines, 'Caused by: '));
      }

      return output;
    };

    const stackTrace = getEnclosedStackTrace(error, [], '');
    const joinedStackTrace = stackTrace.join('\n');
    let resultStackTraceStr: string;

    if (joinedStackTrace.length > ENHANCED_STACK_TRACE_LIMIT) {
      resultStackTraceStr = joinedStackTrace.substring(0, ENHANCED_STACK_TRACE_LIMIT) + ' ...';
    } else {
      resultStackTraceStr = joinedStackTrace;
    }

    return resultStackTraceStr;
  }

  private getAxiosErrorDetails(error: AxiosError) {
    if (!error.isAxiosError) {
      return {};
    }

    if (Logger.config.outputFormat === 'legacy') {
      return {
        request_method: error.config?.method,
        request_url: error.config?.url,
        response_status: error.response ? error.response.status : undefined,
        response_status_text: error.response ? error.response.statusText : undefined,
        response_data: error.response ? this.shortenData(error.response.data) : undefined,
      };
    }

    return {
      url: {
        full: error.config?.url,
      },
      http: {
        request: {
          method: error.config?.method,
        },
        response: {
          status_code: error.response ? error.response.status : undefined,
          body: {
            content: error.response ? this.shortenData(error.response.data) : undefined,
          },
        },
      },
      error: {
        code: error.code,
      },
    };
  }
}
