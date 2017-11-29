'use strict';

const Logger = require('./src/logger/logger');
const isNamespaceEnabled = require('./src/enabled/enabled');
const contextMiddlewareFactory = require('./src/context-middleware-factory/context-middleware-factory');
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
logFactory.getKoaMiddleware = contextMiddlewareFactory.getKoaMiddleware.bind(contextMiddlewareFactory);
logFactory.getExpressMiddleware = contextMiddlewareFactory.getExpressMiddleware.bind(contextMiddlewareFactory);
logFactory.getMiddleware = logFactory.getKoaMiddleware;
logFactory.setOnContext = contextMiddlewareFactory.setOnContext.bind(contextMiddlewareFactory);
logFactory.configure = function(options) {
  Logger.configure(options);
};
logFactory.formatter = formatter;

module.exports = logFactory;
