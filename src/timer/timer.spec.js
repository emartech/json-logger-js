'use strict';

const Logger = require('../logger/logger');
const Timer = require('./timer');

describe('Timer', function() {
  it('should log elapsed time', function() {
    const logger = new Logger('test', false);
    const infoStub = this.sandbox.stub(logger, 'info');
    const timer = new Timer(logger);

    this.clock.tick(100);
    timer.info('time', { customer_id: 10 });

    expect(infoStub).to.have.been. calledWith('time', { customer_id: 10, duration: 100 });
  });

  it('should log elapsed time with error', function() {
    const logger = new Logger('test', false);
    const errorStub = this.sandbox.stub(logger, 'fromError');
    const timer = new Timer(logger);
    const error = new Error('intended');

    this.clock.tick(100);
    timer.fromError('time', error, { customer_id: 10 });

    expect(errorStub).to.have.been. calledWith('time', error, { customer_id: 10, duration: 100 });
  });

  it('should log elapsed time with error', function() {
    const logger = new Logger('test', false);
    const errorStub = this.sandbox.stub(logger, 'warnFromError');
    const timer = new Timer(logger);
    const error = new Error('intended');

    this.clock.tick(100);
    timer.warnFromError('time', error, { customer_id: 10 });

    expect(errorStub).to.have.been. calledWith('time', error, { customer_id: 10, duration: 100 });
  });
});
