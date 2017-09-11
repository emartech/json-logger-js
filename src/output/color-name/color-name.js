'use strict';
let chalk = require('chalk');

let colors = ['cyan', 'magenta', 'grey', 'blue', 'green', 'yellow', 'white', 'red'];
let colorCounter = 0;
let names = {};

module.exports = function colorName(name) {
  if (!names[name]) {
    names[name] = { color: colorCounter % colors.length };
    colorCounter++;
  }

  let color = colors[names[name].color];
  return chalk[color](name);
};

module.exports.colors = colors;
