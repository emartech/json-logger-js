'use strict';

module.exports = {
  lastLog: null,

  elapsedTime: function() {
    const current = this.getCurrentTime();
    let elapsed = 0;

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
