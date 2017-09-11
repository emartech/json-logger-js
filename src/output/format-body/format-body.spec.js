'use strict';
let formatBody = require('./format-body');

describe('formatBody', function() {
  it('should order and stringify keys', function() {
    let logData = { domain: 'mongo', access: 10 };

    expect(formatBody(logData)).to.eql('access=10 domain="mongo"');
  });
});
