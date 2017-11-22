'use strict';

const ContextMiddlewareFactory = require('./context-middleware-factory');
const continuationLocalStorage = require('cls-hooked');

describe('ContextMiddlewareFactory', function() {
  const requestId = 'uuid';
  const requestObject = {
    request : {
      headers : { 'x-request-id' : requestId }
    }
  };
  let next;
  let createNamespaceStub;
  let destroyNamespaceStub;
  let namespaceStub;

  beforeEach(function() {
    next = this.sandbox.stub();
    next.returns(Promise.resolve(true));

    createNamespaceStub = this.sandbox.stub(continuationLocalStorage, 'createNamespace');
    destroyNamespaceStub = this.sandbox.stub(continuationLocalStorage, 'destroyNamespace');
    namespaceStub = {
      set: this.sandbox.stub(),
      bind: this.sandbox.stub(),
      run: this.sandbox.stub(),
      bindEmitter: this.sandbox.stub()
    };
    namespaceStub.bind.returnsArg(0);
    namespaceStub.run.callsArg(0)
    createNamespaceStub.returns(namespaceStub);
  });

  afterEach(function() {
    ContextMiddlewareFactory.destroyNamespace();
  });

  it('should store request id to session information as koa middleware', async function() {
    await ContextMiddlewareFactory.getKoaMiddleware()(requestObject, next);

    expect(next).to.have.been.called;
    expect(createNamespaceStub).to.have.been.calledWith('session');
    expect(namespaceStub.set).to.have.been.calledWith('request_id', requestId);
  });

  it('should store request id to session information as express middleware', function() {
    ContextMiddlewareFactory.getExpressMiddleware()(requestObject.request, {}, next);

    expect(next).to.have.been.called;
    expect(createNamespaceStub).to.have.been.calledWith('session');
    expect(namespaceStub.set).to.have.been.calledWith('request_id', requestId);
  });
});
