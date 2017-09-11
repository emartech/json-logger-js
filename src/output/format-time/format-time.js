'use strict';

module.exports = {
  lastLog: null,

  elapsedTime: function() {
    let elapsed = 0;
    let current = this.getCurrentTime();

    if (this.lastLog) {
      elapsed = current - this.lastLog;
    }

    this.lastLog = current;
    return '+' + elapsed + 'ms';
  },

  getCurrentTime: function() {
    return new Date().getTime();
  }
};
