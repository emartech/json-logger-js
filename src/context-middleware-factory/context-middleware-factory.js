'use strict';

const continuationLocalStorage = require('continuation-local-storage');

class ContextMiddlewareFactory {
  static getMiddleware() {
    return async function(ctx, next) {
      const namespace = continuationLocalStorage.createNamespace('session');

      try{
        await new Promise(namespace.bind(function(resolve, reject) {
          namespace.set('request_id', ctx.request.header['x-request-id']);

          next().then(resolve).catch(reject);
        }));
      } catch(error) {
        throw error;
      } finally {
        continuationLocalStorage.destroyNamespace('session');
      }
    };
  }
}

module.exports = ContextMiddlewareFactory;
