'use strict';

const config = require('../../config');

module.exports = function stringifyLevel(level) {
  return config.coloredNames[level];
};
