'use strict';

const Logger = require('./src/logger/logger');
const isNamespaceEnabled = require('./src/enabled/enabled');
const formatter = require('./src/formatter');

/**
 * @param namespace
 * @param options
 * @returns {Logger}
 */
function logFactory(namespace, options) {
  return new Logger(namespace, isNamespaceEnabled(
    logFactory.getNamespaces(), namespace
  ), options);
}

logFactory.Logger = Logger;
logFactory.getNamespaces = function() {
  return process.env.DEBUG || '';
};
logFactory.configure = function(options) {
  Logger.configure(options);
};
logFactory.formatter = formatter;

module.exports = logFactory;
