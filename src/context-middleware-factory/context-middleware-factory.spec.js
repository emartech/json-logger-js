'use strict';

const ContextMiddlewareFactory = require('./context-middleware-factory');
const continuationLocalStorage = require('continuation-local-storage');

describe('ContextMiddlewareFactory', function() {
  const requestId = 'uuid';
  const requestObject = {
    request : {
      header : { 'x-request-id' : requestId }
    }
  };
  let next;
  let createNamespaceStub;
  let destroyNamespaceStub;
  let namespaceStub;
  let subject;

  beforeEach(function() {
    next = this.sandbox.stub();
    next.returns(Promise.resolve(true));

    createNamespaceStub = this.sandbox.stub(continuationLocalStorage, 'createNamespace');
    destroyNamespaceStub = this.sandbox.stub(continuationLocalStorage, 'destroyNamespace');
    namespaceStub = {
      set: this.sandbox.stub(),
      bind: this.sandbox.stub()
    };
    namespaceStub.bind.returnsArg(0);
    createNamespaceStub.returns(namespaceStub);

    subject = ContextMiddlewareFactory.getMiddleware();
  });

  it('should store request id to session information as middleware', async function() {
    await subject(requestObject, next);

    expect(next).to.have.been.called;
    expect(createNamespaceStub).to.have.been.calledWith('session');
    expect(namespaceStub.set).to.have.been.calledWith('request_id', requestId);
  });

  it('should destroy the namespace after action', async function() {
    await subject(requestObject, next);

    expect(createNamespaceStub).to.have.been.calledWith('session');
    expect(destroyNamespaceStub).to.have.been.calledWith('session');
  });

  it('should destroy the namespace if an error occours', async function() {
    next.returns(Promise.reject(new Error('Action failed')));

    try {
      await subject(requestObject, next);
      throw new Error('should fail');
    } catch(error) {
      expect(error.message).to.eql('Action failed');
      expect(destroyNamespaceStub).to.have.been.calledWith('session');
    }
  });
});
