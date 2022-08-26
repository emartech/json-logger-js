'use strict';

const { createLogger, Logger } = require('./index');

describe('createLogger', function() {
  beforeEach(function() {
    process.env.DEBUG = 'mongo';
  });

  afterEach(function() {
    process.env.DEBUG = '';
  });

  it('should return an enabled log instance when env variable is set to same', function() {
    const logger = createLogger('mongo');

    expect(logger).to.be.an.instanceOf(Logger);
    expect(logger.isEnabled()).to.be.true;
  });

  it('should return a disabled log instance when different', function() {
    const logger = createLogger('redis');

    expect(logger).to.be.an.instanceOf(Logger);
    expect(logger.isEnabled()).to.be.false;
  });
});
