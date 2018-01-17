'use strict';

const logentriesFormatter = require('./logentries');

describe('logentries formatter', function() {
  it('should stringify single field to key value pairs', function() {
    expect(logentriesFormatter({ name: 'debugger' })).to.eql('name="debugger"');
  });

  it('should stringify multiple fields separated', function() {
    expect(logentriesFormatter({ name: 'debugger', namespace: 'it' })).to.eql('name="debugger" namespace="it"');
  });

  it('should not print numbers as string', function() {
    expect(logentriesFormatter({ name: 'debugger', duration: 10, percent: 1.5 }))
      .to.eql('name="debugger" duration=10 percent=1.5');
  });

  it('should json stringify nested objects', function() {
    expect(logentriesFormatter({ name: 'debugger', nested: { inner: 10 } }))
      .to.eql('name="debugger" nested="{"inner":10}"');
  });
});
