'use strict';

const Logger = require('./src/logger/logger');
const Timer = require('./src/timer/timer');
const isNamespaceEnabled = require('./src/enabled/enabled');
const contextMiddlewareFactory = require('./src/context-middleware-factory/context-middleware-factory');

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
logFactory.Timer = Timer;
logFactory.getNamespaces = function() {
  return process.env.DEBUG || '';
};
logFactory.getMiddleware = contextMiddlewareFactory.getMiddleware;

module.exports = logFactory;
