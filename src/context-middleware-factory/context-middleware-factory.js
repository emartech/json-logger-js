'use strict';

const continuationLocalStorage = require('cls-hooked');
const uuid = require('uuid');

class ContextMiddlewareFactory {
  static getMiddleware() {
    const namespace = this._createNamespace();

    return async function(ctx, next) {
      await new Promise(namespace.bind(function(resolve, reject) {
        namespace.set(
          'request_id',
          ctx.request.header['x-request-id'] || uuid.v4()
        );

        next().then(resolve).catch(reject);
      }));
    };
  }

  static setOnContext(key, value) {
    const namespace = this._createNamespace();
    namespace.set(key, value);
  }

  static destroyNamespace() {
    if (this._namespace) {
      continuationLocalStorage.destroyNamespace('session');
    }
  }

  static _createNamespace() {
    if (!this._namespace) {
      this._namespace = continuationLocalStorage.createNamespace('session');
    }
    return this._namespace;
  }
}

module.exports = ContextMiddlewareFactory;
