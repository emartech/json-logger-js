const { expect } = require('chai');
const { jsonFormatter } = require('./json');

describe('json formatter', function() {
  it('should stringify object to json', function() {
    expect(jsonFormatter({ name: 'debugger' })).to.eql('{"name":"debugger"}');
  });
});
