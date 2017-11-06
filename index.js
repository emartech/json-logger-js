'use strict';

const Logger = require('./src/logger/logger');
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
logFactory.getNamespaces = function() {
  return process.env.DEBUG || '';
};
logFactory.getMiddleware = contextMiddlewareFactory.getMiddleware.bind(contextMiddlewareFactory);
logFactory.setOnContext = contextMiddlewareFactory.setOnContext.bind(contextMiddlewareFactory);

module.exports = logFactory;
