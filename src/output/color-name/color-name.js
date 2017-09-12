'use strict';

const chalk = require('chalk');

const colors = ['cyan', 'magenta', 'grey', 'blue', 'green', 'yellow', 'white', 'red'];
const names = {};
let colorCounter = 0;

module.exports = function colorName(name) {
  if (!names[name]) {
    names[name] = { color: colorCounter % colors.length };
    colorCounter++;
  }

  let color = colors[names[name].color];
  return chalk[color](name);
};

module.exports.colors = colors;
