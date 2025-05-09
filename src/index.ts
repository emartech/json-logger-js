import { isNamespaceEnabled } from './enabled/enabled';
import { formatter } from './formatter';
import { Logger, LoggerConfig } from './logger/logger';
export { Logger, LoggerConfig } from './logger/logger';
export { Timer } from './timer/timer';

// eslint-disable-next-line func-style
export function createLogger(namespace: string): Logger {
  return new Logger(namespace, isNamespaceEnabled(createLogger.getNamespaces(), namespace));
}

createLogger.getNamespaces = function (): string {
  return process.env.DEBUG ?? '';
};
createLogger.configure = function (options: Partial<LoggerConfig>): void {
  Logger.configure(options);
};
createLogger.formatter = formatter;
