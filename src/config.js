'use strict';

const chalk = require('chalk');

const levels = {
  trace: {
    number: 10,
    name: 'TRACE'
  },
  debug: {
    number: 20,
    name: 'DEBUG'
  },
  info: {
    number: 30,
    name: 'INFO'
  },
  warn: {
    number: 40,
    name: chalk.yellow('WARN')
  },
  error: {
    number: 50,
    name: chalk.red('ERROR')
  },
  fatal: {
    number: 60,
    name: chalk.red('FATAL')
  },
};

const availableLevels = Object.keys(levels);

const coloredNames = {};
availableLevels.forEach((levelName) => {
  coloredNames[levels[levelName].number] = levels[levelName].name;
});

module.exports = { levels, availableLevels, coloredNames };
