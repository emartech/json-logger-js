'use strict';

const continuationLocalStorage = require('cls-hooked');
const uuid = require('uuid');

class ContextMiddlewareFactory {
  static getKoaMiddleware() {
    const namespace = this._createNamespace();

    return async function(ctx, next) {
      await new Promise(namespace.bind(function(resolve, reject) {
        namespace.set(
          'request_id',
          ctx.request.headers['x-request-id'] || uuid.v4()
        );

        next().then(resolve).catch(reject);
      }));
    };
  }

  static getExpressMiddleware() {
    const namespace = this._createNamespace();

    return (req, res, next) => {
      namespace.bindEmitter(req);
      namespace.bindEmitter(res);

      namespace.run(() => {
        namespace.set(
          'request_id',
          req.headers['x-request-id'] || uuid.v4()
        );

        next();
      });
    };
  }

  static setOnContext(key, value) {
    const namespace = this._createNamespace();
    namespace.set(key, value);
  }

  static destroyNamespace() {
    if (this._namespace) {
      continuationLocalStorage.destroyNamespace('session');
      this._namespace = null;
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
