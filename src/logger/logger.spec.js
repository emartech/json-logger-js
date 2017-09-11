'use strict';
let Logger = require('./logger');
const continuationLocalStorage = require('continuation-local-storage');

describe('Logger', function() {
  let logger;

  beforeEach(function() {
    logger = new Logger('mongo', true);
    this.sandbox.stub(console, 'log');
  });

  it('should call log info method when enabled', function() {
    logger.info('wedidit', { details: 'forever' });

    let logArguments = JSON.parse(console.log.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('wedidit');
    expect(logArguments.level).to.eql(30);
    expect(logArguments.details).to.eql('forever');
  });

  it('should log prequest id if there is namespace present', function() {
    let namespace = continuationLocalStorage
      .createNamespace('session');

    namespace.run(function(){
      namespace.set('request_id', 'uid');
      logger.info('wedidit');
      let logArguments = JSON.parse(console.log.args[0]);
      expect(logArguments.request_id).to.eql('uid');
    });
  });

  it('should not call log info method when disabled', function() {
    logger = new Logger('mongo', false);

    logger.info('hi');

    expect(console.log).not.to.have.been.called;
  });

  it('should log error with action', function() {
    let error = new Error('failed');

    logger.fromError('hi', error, { details: 'here' });

    let logArguments = JSON.parse(console.log.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(50);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
  });
});
