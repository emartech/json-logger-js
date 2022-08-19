'use strict';

const { debugFormatter } = require('./debug');
const { ColorName } = require('../output/color-name/color-name');

describe('debug formatter', function() {
  afterEach(function () {
    ColorName.reset();
  });

  it('should format line', function() {
    const logLine = { level: 10, time: new Date().toISOString(), name: 'redis', random: 15 };

    expect(debugFormatter(logLine)).to.eql('\u001b[36mredis\u001b[39m TRACE +0ms random=15');
  });
});
