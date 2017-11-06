'use strict';

const config = require('../config');
const continuationLocalStorage = require('cls-hooked');
const _ = require('lodash');
const STACK_TRACE_LIMIT = 4000;
const Timer = require('../timer/timer');

const logMethodFactory = function(level) {
  return function(action, data) {
    if (!this._enabled) {
      return;
    }

    const contextNamespace = continuationLocalStorage.getNamespace('session');
    const contextStorage = (contextNamespace && contextNamespace.active) ?
      _.omit(contextNamespace.active, 'id', '_ns_name') : {};

    console.log(JSON.stringify(Object.assign(
      {
        name: this._namespace,
        action: action,
        level: config.levels[level].number,
        time: new Date().toISOString()
      },
      contextStorage,
      data
    )));
  }
};

class Logger {
  constructor(namespace, enabled) {
    this._namespace = namespace;
    this._enabled = enabled;
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

  timer() {
    return new Timer(this);
  }

  _shortenStackTrace(error) {
    return error.stack.length > STACK_TRACE_LIMIT
      ? error.stack.substring(0, STACK_TRACE_LIMIT) + ' ...'
      : error.stack
  }
}

Logger.prototype.trace = logMethodFactory('trace');
Logger.prototype.debug = logMethodFactory('debug');
Logger.prototype.info = logMethodFactory('info');
Logger.prototype.warn = logMethodFactory('warn');
Logger.prototype.error = logMethodFactory('error');
Logger.prototype.fatal = logMethodFactory('fatal');

module.exports = Logger;
