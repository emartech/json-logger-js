'use strict';

const jsonFormatter = require('./json');
const debugFormatter = require('./debug');

module.exports = {
  json: jsonFormatter,
  debug: debugFormatter
};
