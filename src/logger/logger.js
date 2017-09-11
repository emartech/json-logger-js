'use strict';

let config = require('../config');
const continuationLocalStorage = require('continuation-local-storage');


let logMethodFactory = function(level) {
  return function(action, data) {
    if (!this.enabled) {
      return;
    }

    const namespace = continuationLocalStorage.getNamespace('session');
    const storage = namespace ? { request_id : namespace.get('request_id') }: {};

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
      error_stack: error.stack,
      error_message: error.message
    }, options));
  }
}

Logger.prototype.trace = logMethodFactory('trace');
Logger.prototype.debug = logMethodFactory('debug');
Logger.prototype.info = logMethodFactory('info');
Logger.prototype.warn = logMethodFactory('warn');
Logger.prototype.error = logMethodFactory('error');
Logger.prototype.fatal = logMethodFactory('fatal');

module.exports = Logger;
