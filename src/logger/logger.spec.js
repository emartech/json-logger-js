'use strict';

const Logger = require('./logger');
const continuationLocalStorage = require('cls-hooked');
const jsonFormatter = require('../formatter/json');
const consoleOutput = require('../output/console');

describe('Logger', function() {
  let logger;

  beforeEach(function() {
    logger = new Logger('mongo', true);
    this.sandbox.stub(console, 'log');
  });

  afterEach(function() {
    Logger.configure({
      formatter: jsonFormatter,
      output: consoleOutput
    });
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

  it('should log error as warning with action', function() {
    const error = new Error('failed');

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(console.log.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(40);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
  });

  describe('#configure', function() {
    it('should change format method', function() {
      const formattedOutput = '{"my":"method"}';
      const formatterStub = this.sandbox.stub();
      formatterStub.returns(formattedOutput);

      Logger.configure({
        formatter: formatterStub
      });
      logger.info('hi');

      expect(formatterStub).to.have.been.called;
      expect(console.log).to.have.been.calledWith(formattedOutput);
    });

    it('should change output method', function() {
      const outputStub = this.sandbox.stub();
      Logger.configure({
        output: outputStub
      });
      logger.info('hi');

      expect(outputStub).to.have.been.called;
    });

    it('should throw error on invalid config', function() {
      try {
        Logger.configure({
          invalid: true
        });
        throw new Error('should throw');
      } catch(e) {
        expect(e.message).to.eql('Only the following keys are allowed: formatter, output');
      }
    });
  });
});
