'use strict';

const Logger = require('./logger');
const jsonFormatter = require('../formatter/json');
const consoleOutput = require('../output/console');

describe('Logger', function() {
  let logger;
  let outputStub;

  beforeEach(function() {
    logger = new Logger('mongo', true);
    outputStub = this.sandbox.stub(Logger.config, 'output');
  });

  afterEach(function() {
    Logger.configure({
      formatter: jsonFormatter,
      output: consoleOutput,
      transformers: []
    });
  });

  it('should call log info method when enabled', function() {
    logger.info('wedidit', { details: 'forever' });

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('wedidit');
    expect(logArguments.level).to.eql(30);
    expect(logArguments.details).to.eql('forever');
  });

  it('should be callable without the data object', function() {
    logger.info('wedidit');

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('wedidit');
    expect(logArguments.level).to.eql(30);
  });

  it('should not call log info method when disabled', function() {
    logger = new Logger('mongo', false);

    logger.info('hi');

    expect(Logger.config.output).not.to.have.been.called;
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
    error.data = { test: 'data' };

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(50);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
    expect(logArguments.error_data).to.eql(JSON.stringify(error.data));
  });

  it('should log error as warning with action', function() {
    const error = new Error('failed');
    error.data = { test: 'data' };

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(40);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
    expect(logArguments.error_data).to.eql(JSON.stringify(error.data));
  });

  it('should not log error data when it is undefined', function() {
    const error = new Error('failed');

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(40);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
    expect(logArguments).to.not.have.any.keys('error_data');
  });

  it('should log only 3000 character of data', function() {
    const error = new Error('failed');
    error.data = 'exactlyTen'.repeat(400);

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(40);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
    expect(logArguments.error_data.length).to.eql(3004);
  });

  it('should log request/response details for Axios-like error objects', function() {
    const error = new Error('Request failed with status code 500');
    error.isAxiosError = true;
    error.response = {
      status: 500,
      statusText: 'Something horrible happened',
      data: { useful_detail: 'important info' }
    };
    error.config = {
      url: 'http://amazinghost.com/beautiful-path',
      method: 'get'
    };

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(Logger.config.output.args[0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(50);

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
    expect(logArguments.request_method).to.eql(error.config.method);
    expect(logArguments.request_url).to.eql(error.config.url);
    expect(logArguments.response_status).to.eql(error.response.status);
    expect(logArguments.response_status_text).to.eql(error.response.statusText);
    expect(logArguments.response_data).to.eql(JSON.stringify(error.response.data));
  });

  describe('#customError', function() {
    it('should log error as the given severity with action', function() {
      const error = new Error('failed');
      error.data = { test: 'data' };

      logger.customError('info', 'hi', error, { details: 'here' });

      const logArguments = JSON.parse(Logger.config.output.args[0]);
      expect(logArguments.name).to.eql('mongo');
      expect(logArguments.action).to.eql('hi');
      expect(logArguments.level).to.eql(30);
      expect(logArguments.details).to.eql('here');

      expect(logArguments.error_name).to.eql(error.name);
      expect(logArguments.error_stack).to.eql(error.stack);
      expect(logArguments.error_message).to.eql(error.message);
      expect(logArguments.error_data).to.eql(JSON.stringify(error.data));
    });

    it('should not log error data when it is undefined', function() {
      const error = new Error('failed');

      logger.customError('warn', 'hi', error, { details: 'here' });

      const logArguments = JSON.parse(Logger.config.output.args[0]);
      expect(logArguments.name).to.eql('mongo');
      expect(logArguments.action).to.eql('hi');
      expect(logArguments.level).to.eql(40);
      expect(logArguments.details).to.eql('here');

      expect(logArguments.error_name).to.eql(error.name);
      expect(logArguments.error_stack).to.eql(error.stack);
      expect(logArguments.error_message).to.eql(error.message);
      expect(logArguments).to.not.have.any.keys('error_data');
    });

    it('should log only 3000 character of data', function() {
      const error = new Error('failed');
      error.data = 'exactlyTen'.repeat(400);

      logger.customError('error', 'hi', error, { details: 'here' });

      const logArguments = JSON.parse(Logger.config.output.args[0]);
      expect(logArguments.name).to.eql('mongo');
      expect(logArguments.action).to.eql('hi');
      expect(logArguments.level).to.eql(50);
      expect(logArguments.details).to.eql('here');

      expect(logArguments.error_name).to.eql(error.name);
      expect(logArguments.error_stack).to.eql(error.stack);
      expect(logArguments.error_message).to.eql(error.message);
      expect(logArguments.error_data.length).to.eql(3004);
    });
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
      expect(Logger.config.output).to.have.been.calledWith(formattedOutput);
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
      } catch (e) {
        expect(e.message).to.eql('Only the following keys are allowed: formatter, output');
      }
    });

    it('should modify logged data based on transformers', function() {
      Logger.configure({
        transformers: [log => Object.assign({ debug: true }, log)]
      });

      logger.info('hi');

      const logArguments = JSON.parse(Logger.config.output.args[0]);
      expect(logArguments.action).to.eql('hi');
      expect(logArguments.debug).to.eql(true);
    });
  });
});
