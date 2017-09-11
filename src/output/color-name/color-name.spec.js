'use strict';

let colorName = require('./color-name');

describe('colorName', function() {
  it('should pick the first color for the name', function() {
    expect(colorName('mongo')).to.eql('\u001b[36mmongo\u001b[39m');
  });

  it('should pick the same color for same name', function() {
    expect(colorName('mongo')).to.eql(colorName('mongo'));
  });

  it('should add different colors for different names', function() {
    let firstName = colorName('mongo');
    let secondName = colorName('redis');

    expect(secondName.replace('redis', 'mongo')).not.to.eql(firstName);
  });
});
