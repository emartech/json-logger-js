'use strict';

const chalk = require('chalk');
const colors = ['cyan', 'magenta', 'grey', 'blue', 'green', 'yellow', 'white', 'red'];

class ColorName {
  static addColor(name) {
    if (!this.names[name]) {
      this.names[name] = { color: this.counter % colors.length };
      this.counter++;
    }

    const color = colors[this.names[name].color];
    return chalk[color](name);
  }

  static reset() {
    this.counter = 0;
    this.names = {};
  }
}

ColorName.counter = 0;
ColorName.names = {};
ColorName.colors = colors;

module.exports = ColorName;
