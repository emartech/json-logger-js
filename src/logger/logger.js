'use strict';

const config = require('../config');
const continuationLocalStorage = require('cls-hooked');
const _ = require('lodash');
const STACK_TRACE_LIMIT = 4000;

const logMethodFactory = function(level) {
  return function(action, data) {
    if (!this.enabled) {
      return;
    }

    const namespace = continuationLocalStorage.getNamespace('session');
    const storage = (namespace && namespace.active) ? _.omit(namespace.active, 'id', '_ns_name') : {};

    console.log(JSON.stringify(Object.assign(
      {
        name: this.namespace,
        action: action,
        level: config.levels[level].number,
        time: new Date().toISOString()
      },
      storage,
      data
    )));
  }
};

class Logger {
  constructor(namespace, enabled) {
    this.namespace = namespace;
    this.enabled = enabled;
  }

  fromError(action, error, options = {}) {
    this.error(action, Object.assign({
      error_name: error.name,
      error_stack: this._shortenStackTrace(error),
      error_message: error.message
    }, options));
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
