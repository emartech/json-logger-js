'use strict';
let config = require('../../config');

module.exports = function stringifyLevel(level) {
  return config.coloredNames[level];
};
