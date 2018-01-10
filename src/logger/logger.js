'use strict';

const config = require('../config');
const continuationLocalStorage = require('cls-hooked');
const STACK_TRACE_LIMIT = 4000;
const Timer = require('../timer/timer');
const jsonFormatter = require('../formatter/json');
const consoleOutput = require('../output/console');
const allowedKeys = ['output', 'formatter'];

const getContextStorage = function() {
  const contextNamespace = continuationLocalStorage.getNamespace('session');
  if (contextNamespace && contextNamespace.active) {
    const { id, _ns_name, ...contextData } = contextNamespace.active;
    return contextData;
  }

  return {};
};

class Logger {
  constructor(namespace, enabled) {
    this._namespace = namespace;
    this._enabled = enabled;
  }

  static configure(options = {}) {
    this._validate(options);
    Object.assign(Logger.config, options);
  }

  static _validate(options) {
    Object.keys(options).forEach(key => {
      if (!allowedKeys.includes(key)) {
        throw new Error('Only the following keys are allowed: formatter, output')
      }
    });
  }

  isEnabled() {
    return this._enabled;
  }

  fromError(action, error, data = {}) {
    this.error(action, Object.assign({
      error_name: error.name,
      error_stack: this._shortenStackTrace(error),
      error_message: error.message
    }, data));
  }

  warnFromError(action, error, data = {}) {
    this.warn(action, Object.assign({
      error_name: error.name,
      error_stack: this._shortenStackTrace(error),
      error_message: error.message
    }, data));
  }

  timer() {
    return new Timer(this);
  }

  _shortenStackTrace(error) {
    return error.stack.length > STACK_TRACE_LIMIT
      ? error.stack.substring(0, STACK_TRACE_LIMIT) + ' ...'
      : error.stack
  }
}

Logger.config = {
  formatter: jsonFormatter,
  output: consoleOutput
};

const logMethodFactory = function(level) {
  return function(action, data) {
    if (!this._enabled) {
      return;
    }

    const dataToLog = Object.assign(
      {
        name: this._namespace,
        action: action,
        level: config.levels[level].number,
        time: new Date().toISOString()
      },
      getContextStorage(),
      data
    );

    Logger.config.output(
      Logger.config.formatter(dataToLog)
    );
  }
};

Logger.prototype.trace = logMethodFactory('trace');
Logger.prototype.debug = logMethodFactory('debug');
Logger.prototype.info = logMethodFactory('info');
Logger.prototype.warn = logMethodFactory('warn');
Logger.prototype.error = logMethodFactory('error');
Logger.prototype.fatal = logMethodFactory('fatal');

module.exports = Logger;
