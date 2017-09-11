'use strict';
let stringifyLevel = require('./stringify-level');

describe('stringifyLevel', function() {
  it('should transform code to readable text', function() {
    expect(stringifyLevel(10)).to.eql('TRACE');
    expect(stringifyLevel(20)).to.eql('DEBUG');
    expect(stringifyLevel(30)).to.eql('INFO');
    expect(stringifyLevel(40)).to.eql('\u001b[33mWARN\u001b[39m');
    expect(stringifyLevel(50)).to.eql('\u001b[31mERROR\u001b[39m');
    expect(stringifyLevel(60)).to.eql('\u001b[31mFATAL\u001b[39m');
  });
});
