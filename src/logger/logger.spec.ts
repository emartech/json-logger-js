import { expect } from 'chai';
import sinon, { SinonFakeTimers, SinonStub } from 'sinon';
import { Logger } from './logger';
import { jsonFormatter } from '../formatter/json';
import { consoleOutput } from '../output/console';
import { AxiosError } from 'axios';

describe('Logger', () => {
  let logger: Logger;
  let clock: SinonFakeTimers;
  let outputStub: SinonStub;

  beforeEach(() => {
    logger = new Logger('mongo', true);
    outputStub = sinon.stub(Logger.config, 'output');
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    Logger.configure({
      formatter: jsonFormatter,
      output: consoleOutput,
      transformers: [],
      outputFormat: 'ecs',
    });
    clock.restore();
  });

  it('should call log info method when enabled (legacy format)', () => {
    Logger.configure({ outputFormat: 'legacy' });
    logger.info('wedidit', { details: 'forever' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('wedidit');
    expect(logArguments.level).to.eql(30);
    expect(logArguments.details).to.eql('forever');
  });

  it('should call log info method when enabled (ecs format)', () => {
    Logger.configure({ outputFormat: 'ecs' });
    logger.info('wedidit', { details: 'forever' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.event.action).to.eql('wedidit');
    expect(logArguments.log.logger).to.eql('mongo');
    expect(logArguments.log.level).to.eql(30);
    expect(logArguments.details).to.eql('forever');
  });

  it('should be callable without the data object', () => {
    logger.info('wedidit');

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.event.action).to.eql('wedidit');
    expect(logArguments.log.logger).to.eql('mongo');
    expect(logArguments.log.level).to.eql(30);
  });

  it('should not call log info method when disabled', () => {
    logger = new Logger('mongo', false);

    logger.info('hi');

    expect(Logger.config.output).not.to.have.been.called;
  });

  it('should not call log info method when disabled (timer)', () => {
    logger = new Logger('mongo', false);
    const timer = logger.timer();
    const infoStub = sinon.stub(logger, 'info');

    clock.tick(100);
    timer.info('hi');

    expect(infoStub).to.have.been.calledWith('hi', { event: { duration: 100 } });
  });

  it('should log error with action (legacy format)', () => {
    Logger.configure({ outputFormat: 'legacy' });

    const error: Error & { data?: any } = new Error('failed');
    error.data = { test: 'data' };

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.name).to.eql('mongo');
    expect(logArguments.action).to.eql('hi');
    expect(logArguments.level).to.eql(50);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error_name).to.eql(error.name);
    expect(logArguments.error_stack).to.eql(error.stack);
    expect(logArguments.error_message).to.eql(error.message);
    expect(logArguments.error_data).to.eql(JSON.stringify(error.data));
  });

  it('should log error with action (ecs format)', () => {
    Logger.configure({ outputFormat: 'ecs' });

    const error: Error & { data?: any } = new Error('failed');
    error.data = { test: 'data' };

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.event.action).to.eql('hi');
    expect(logArguments.log.logger).to.eql('mongo');
    expect(logArguments.log.level).to.eql(50);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error.type).to.eql(error.name);
    expect(logArguments.error.stack_trace).to.eql(error.stack);
    expect(logArguments.error.message).to.eql(error.message);
    expect(logArguments.error.context).to.eql(JSON.stringify(error.data));
  });

  it('should log error as warning with action', () => {
    const error: Error & { data?: any } = new Error('failed');
    error.data = { test: 'data' };

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.event.action).to.eql('hi');
    expect(logArguments.log.logger).to.eql('mongo');
    expect(logArguments.log.level).to.eql(40);
    expect(logArguments.details).to.eql('here');

    expect(logArguments.error.type).to.eql(error.name);
    expect(logArguments.error.stack_trace).to.eql(error.stack);
    expect(logArguments.error.message).to.eql(error.message);
    expect(logArguments.error.context).to.eql(JSON.stringify(error.data));
  });

  it('should not log error data when it is undefined', () => {
    const error = new Error('failed');

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.error).to.not.have.any.keys('context');
  });

  it('should log only 3000 character of data', () => {
    const error: Error & { data?: any } = new Error('failed');
    error.data = 'exactlyTen'.repeat(400);

    logger.warnFromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.error.context.length).to.eql(3004);
  });

  it('should log request/response details for Axios-like error objects (legacy format)', () => {
    Logger.configure({ outputFormat: 'legacy' });

    const error = new AxiosError('Request failed with status code 500');
    error.response = {
      status: 500,
      statusText: 'Something horrible happened',
      data: { useful_detail: 'important info' },
      headers: {},
      config: {},
    };
    error.config = {
      url: 'http://amazinghost.com/beautiful-path',
      method: 'get',
    };

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
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

  it('should log request/response details for Axios-like error objects (ecs format)', () => {
    Logger.configure({ outputFormat: 'ecs' });

    const error = new AxiosError('Request failed with status code 500');
    error.response = {
      status: 500,
      statusText: 'Something horrible happened',
      data: { useful_detail: 'important info' },
      headers: {},
      config: {},
    };
    error.config = {
      url: 'http://amazinghost.com/beautiful-path',
      method: 'get',
    };

    logger.fromError('hi', error, { details: 'here' });

    const logArguments = JSON.parse(outputStub.args[0][0]);
    expect(logArguments.log.logger).to.eql('mongo');
    expect(logArguments.event.action).to.eql('hi');
    expect(logArguments.log.level).to.eql(50);

    expect(logArguments.error.type).to.eql(error.name);
    expect(logArguments.error.stack_trace).to.eql(error.stack);
    expect(logArguments.error.message).to.eql(error.message);
    expect(logArguments.http.request.method).to.eql(error.config.method);
    expect(logArguments.url.full).to.eql(error.config.url);
    expect(logArguments.http.response.status_code).to.eql(error.response.status);
    expect(logArguments.http.response.body.content).to.eql(JSON.stringify(error.response.data));
  });

  describe('#customError', () => {
    it('should log error as the given severity with action', () => {
      const error: Error & { data?: any } = new Error('failed');
      error.data = { test: 'data' };

      logger.customError('info', 'hi', error, { details: 'here' });

      const logArguments = JSON.parse(outputStub.args[0][0]);
      expect(logArguments.event.action).to.eql('hi');
      expect(logArguments.log.logger).to.eql('mongo');
      expect(logArguments.log.level).to.eql(30);
      expect(logArguments.details).to.eql('here');

      expect(logArguments.error.type).to.eql(error.name);
      expect(logArguments.error.stack_trace).to.eql(error.stack);
      expect(logArguments.error.message).to.eql(error.message);
      expect(logArguments.error.context).to.eql(JSON.stringify(error.data));
    });

    it('should not log error data when it is undefined', () => {
      const error = new Error('failed');

      logger.customError('warn', 'hi', error, { details: 'here' });

      const logArguments = JSON.parse(outputStub.args[0][0]);
      expect(logArguments.error).to.not.have.any.keys('context');
    });

    it('should log only 3000 character of data', () => {
      const error: Error & { data?: any } = new Error('failed');
      error.data = 'exactlyTen'.repeat(400);

      logger.customError('error', 'hi', error, { details: 'here' });

      const logArguments = JSON.parse(outputStub.args[0][0]);
      expect(logArguments.error.context.length).to.eql(3004);
    });

    describe('when not an Error instance is passed as error', () => {
      [
        { type: 'custom object', value: {} },
        { type: 'string', value: 'error' },
        { type: 'null', value: null },
        { type: 'number', value: 12 },
        { type: 'bool', value: true },
      ].forEach(({ type, value }) => {
        it(`should not throw error when ${type} is passed as error`, () => {
          expect(() => logger.customError('error', 'hi', value as Error, { details: 'here' })).to.not.throw();
        });
      });

      it('should log error properties from custom error object', () => {
        const errorObject = { name: 'Error', message: 'My custom error', stack: 'Stack', data: { value: 1 } };

        logger.customError('error', 'hi', errorObject, { details: 'here' });

        const logArguments = JSON.parse(outputStub.args[0][0]);

        expect(logArguments.error.type).to.eql(errorObject.name);
        expect(logArguments.error.stack_trace).to.eql(errorObject.stack);
        expect(logArguments.error.message).to.eql(errorObject.message);
        expect(logArguments.error.context).to.eql(JSON.stringify(errorObject.data));
      });

      it('should not log additional or missing error properties from custom error object', () => {
        const errorObject = { color: 'color', value: 'value' };

        // @ts-expect-error TS2345
        logger.customError('error', 'hi', errorObject, { details: 'here' });

        const logArguments = JSON.parse(outputStub.args[0][0]);

        expect(logArguments).to.not.have.any.keys('error_name', 'error_stack', 'error_message', 'error_data');
        expect(logArguments).to.not.have.any.keys('color', 'value');
      });
    });
  });

  describe('#configure', () => {
    it('should change format method', () => {
      const formattedOutput = '{"my":"method"}';
      const formatterStub = sinon.stub();
      formatterStub.returns(formattedOutput);

      Logger.configure({
        formatter: formatterStub,
      });
      logger.info('hi');

      expect(formatterStub).to.have.been.called;
      expect(Logger.config.output).to.have.been.calledWith(formattedOutput);
    });

    it('should change output method', () => {
      const outputStub = sinon.stub();
      Logger.configure({
        output: outputStub,
      });
      logger.info('hi');

      expect(outputStub).to.have.been.called;
    });

    it('should change output format', () => {
      Logger.configure({
        outputFormat: 'legacy',
      });
      logger.info('hi');

      const logArguments = JSON.parse(outputStub.args[0][0]);
      expect(logArguments.action).to.eql('hi');
      expect(logArguments.event).to.be.undefined;
    });

    it('should throw error on invalid config', () => {
      try {
        Logger.configure({
          // @ts-expect-error TS2345
          invalid: true,
        });
        throw new Error('should throw');
      } catch (e) {
        expect((e as Error).message).to.eql(
          'Only the following keys are allowed: output,formatter,transformers,outputFormat',
        );
      }
    });

    it('should modify logged data based on transformers', () => {
      Logger.configure({
        transformers: [(log: any) => Object.assign({ debug: true }, log)],
      });

      logger.info('hi');

      const logArguments = JSON.parse(outputStub.args[0][0]);
      expect(logArguments.event.action).to.eql('hi');
      expect(logArguments.debug).to.eql(true);
    });
  });
});
