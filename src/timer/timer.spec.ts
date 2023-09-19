import { expect } from 'chai';
import { SinonFakeTimers, useFakeTimers, stub } from 'sinon';
import { Logger } from '../logger/logger';
import { Timer } from './timer';

describe('Timer', () => {
  let clock: SinonFakeTimers;

  beforeEach(() => {
    clock = useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
    Logger.configure({ outputFormat: 'ecs' });
  });

  describe('legacy format', () => {
    beforeEach(() => {
      Logger.configure({ outputFormat: 'legacy' });
    });

    it('should log elapsed time (legacy format)', () => {
      const logger = new Logger('test', false);
      const infoStub = stub(logger, 'info');
      const timer = new Timer(logger);

      clock.tick(100);
      timer.info('time', { customer_id: 10 });

      expect(infoStub).to.have.been.calledWith('time', { customer_id: 10, duration: 100 });
    });

    it('should log elapsed time with error', () => {
      const logger = new Logger('test', false);
      const errorStub = stub(logger, 'fromError');
      const timer = new Timer(logger);
      const error = new Error('intended');

      clock.tick(100);
      timer.fromError('time', error, { customer_id: 10 });

      expect(errorStub).to.have.been.calledWith('time', error, { customer_id: 10, duration: 100 });
    });

    it('should log elapsed time with error', () => {
      const logger = new Logger('test', false);
      const errorStub = stub(logger, 'warnFromError');
      const timer = new Timer(logger);
      const error = new Error('intended');

      clock.tick(100);
      timer.warnFromError('time', error, { customer_id: 10 });

      expect(errorStub).to.have.been.calledWith('time', error, { customer_id: 10, duration: 100 });
    });
  });

  describe('ecs format', () => {
    it('should log elapsed time (legacy format)', () => {
      const logger = new Logger('test', false);
      const infoStub = stub(logger, 'info');
      const timer = new Timer(logger);

      clock.tick(100);
      timer.info('time', { customer_id: 10 });

      expect(infoStub).to.have.been.calledWith('time', { customer_id: 10, event: { duration: 100 } });
    });

    it('should log elapsed time with error', () => {
      const logger = new Logger('test', false);
      const errorStub = stub(logger, 'fromError');
      const timer = new Timer(logger);
      const error = new Error('intended');

      clock.tick(100);
      timer.fromError('time', error, { customer_id: 10 });

      expect(errorStub).to.have.been.calledWith('time', error, { customer_id: 10, event: { duration: 100 } });
    });

    it('should log elapsed time with error', () => {
      const logger = new Logger('test', false);
      const errorStub = stub(logger, 'warnFromError');
      const timer = new Timer(logger);
      const error = new Error('intended');

      clock.tick(100);
      timer.warnFromError('time', error, { customer_id: 10 });

      expect(errorStub).to.have.been.calledWith('time', error, { customer_id: 10, event: { duration: 100 } });
    });

    it('should not overwrite ecs fields', () => {
      const logger = new Logger('test', false);
      const logStub = stub(logger, 'warn');
      const timer = new Timer(logger);

      clock.tick(100);
      timer.warn('time', { event: { majomkutya: 1 } });

      expect(logStub).to.have.been.calledWith('time', { event: { duration: 100, majomkutya: 1 } });
    });
  });
});
