'use strict';

const Logger = require('./logger');
const continuationLocalStorage = require('cls-hooked');

describe('Logger', function() {
  let logger;

  beforeEach(function() {
    logger = new Logger('mongo', true);
    this.sandbox.stub(console, 'log');
  });

  it('should call log info method when enabled', function() {
    logger.info('wedidit', { details: 'forever' });

    const logArguments = JSON.parse(console.log.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('wedidit');
    expect(logArguments.level).to.eql(30);
    expect(logArguments.details).to.eql('forever');
  });

  it('should log prequest id if there is namespace present', function() {
    const namespace = continuationLocalStorage
      .createNamespace('session');

    namespace.run(function(){
      namespace.set('request_id', 'uid');
      logger.info('wedidit');
      const logArguments = JSON.parse(console.log.args[0]);
      expect(logArguments.request_id).to.eql('uid');
    });
  });

  it('should not call log info method when disabled', function() {
    logger = new Logger('mongo', false);

    logger.info('hi');

    expect(console.log).not.to.have.been.called;
  });

  it('should not call log info method when disabled', function() {
    logger = new Logger('mongo', false);
    const timer = logger.timer();
    const infoStub = this.sandbox.stub(logger, 'info');

    this.clock.tick(100);
    timer.info('hi');

    expect(infoStub).to.have.been.calledWith('hi', { duration: 100 });
  });

  it('should log error with action', function() {
    const error = new Error('failed');

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(console.log.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(50);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
  });
});
