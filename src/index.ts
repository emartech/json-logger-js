import { Logger, LoggerConfig } from './logger/logger';
export { Logger, LoggerConfig } from './logger/logger';
import { Timer } from './timer/timer';
export { Timer } from './timer/timer';
import { isNamespaceEnabled } from './enabled/enabled';
import { formatter } from './formatter';

export function logFactory(namespace: string): Logger {
  return new Logger(namespace, isNamespaceEnabled(
    logFactory.getNamespaces(), namespace
  ));
}

logFactory.Logger = Logger;
logFactory.Timer = Timer;
logFactory.getNamespaces = function(): string {
  return process.env.DEBUG || '';
};
logFactory.configure = function(options: LoggerConfig): void {
  Logger.configure(options);
};
logFactory.formatter = formatter;

export default logFactory;
module.exports = logFactory;
