'use strict';

const logMethodFactory = function(level) {
  return function(action, data) {
    this._logger[level](
      action,
      Object.assign({ duration: this._duration() }, data)
    );
  }
};

class Timer {
  constructor(logger) {
    this._logger = logger;
    this._start = new Date().getTime();
  }

  fromError(action, error, data = {}) {
    this._logger.fromError(
      action,
      error,
      Object.assign({ duration: this._duration() }, data)
    );
  }

  _duration() {
    const end = new Date().getTime();

    return end - this._start;
  }
}

Timer.prototype.trace = logMethodFactory('trace');
Timer.prototype.debug = logMethodFactory('debug');
Timer.prototype.info = logMethodFactory('info');
Timer.prototype.warn = logMethodFactory('warn');
Timer.prototype.error = logMethodFactory('error');
Timer.prototype.fatal = logMethodFactory('fatal');

module.exports = Timer;
