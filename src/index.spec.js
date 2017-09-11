'use strict';
let logFactory = require('../index');
let Logger = require('./logger/logger');

describe('LogFactory', function() {
  beforeEach(function() {
    process.env.DEBUG = 'mongo';
  });

  afterEach(function() {
    process.env.DEBUG = '';
  });

  it('should return an enabled log instance when env variable is set to same', function() {
    let logger = logFactory('mongo');

    expect(logger).to.be.an.instanceOf(Logger);
    expect(logger.enabled).to.be.true;
  });

  it('should return a disabled log instance when different', function() {
    let logger = logFactory('redis');

    expect(logger).to.be.an.instanceOf(Logger);
    expect(logger.enabled).to.be.false;
  });

  it('should be mockable through public interface', function() {
    this.sandbox.stub(logFactory.Logger.prototype, 'info');

    let logger = logFactory('mongo');
    logger.info('hello');

    expect(logFactory.Logger.prototype.info).to.have.been.calledWith('hello');
  })
});
