const { expect } = require('chai');
const sinon = require('sinon');
const { Logger } = require('../logger/logger');
const { Timer } = require('./timer');

describe('Timer', function() {
  let clock;

  beforeEach(() => {
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it('should log elapsed time', function() {
    const logger = new Logger('test', false);
    const infoStub = sinon.stub(logger, 'info');
    const timer = new Timer(logger);

    clock.tick(100);
    timer.info('time', { customer_id: 10 });

    expect(infoStub).to.have.been. calledWith('time', { customer_id: 10, duration: 100 });
  });

  it('should log elapsed time with error', function() {
    const logger = new Logger('test', false);
    const errorStub = sinon.stub(logger, 'fromError');
    const timer = new Timer(logger);
    const error = new Error('intended');

    clock.tick(100);
    timer.fromError('time', error, { customer_id: 10 });

    expect(errorStub).to.have.been. calledWith('time', error, { customer_id: 10, duration: 100 });
  });

  it('should log elapsed time with error', function() {
    const logger = new Logger('test', false);
    const errorStub = sinon.stub(logger, 'warnFromError');
    const timer = new Timer(logger);
    const error = new Error('intended');

    clock.tick(100);
    timer.warnFromError('time', error, { customer_id: 10 });

    expect(errorStub).to.have.been.calledWith('time', error, { customer_id: 10, duration: 100 });
  });
});
