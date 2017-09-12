'use strict';

class Timer {
  constructor() {
    this.start = new Date().getTime();
  }

  elapsedTime() {
    const end = new Date().getTime();

    return end - this.start;
  }
}

module.exports = Timer;
