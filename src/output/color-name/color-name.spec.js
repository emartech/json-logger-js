'use strict';

const ColorName = require('./color-name');

describe('colorName', function() {
  afterEach(function () {
    ColorName.reset();
  });

  it('should pick the first color for the name', function() {
    expect(ColorName.addColor('mongo')).to.eql('\u001b[36mmongo\u001b[39m');
  });

  it('should pick the same color for same name', function() {
    expect(ColorName.addColor('mongo')).to.eql(ColorName.addColor('mongo'));
  });

  it('should add different colors for different names', function() {
    const firstName = ColorName.addColor('mongo');
    const secondName = ColorName.addColor('redis');

    expect(secondName.replace('redis', 'mongo')).not.to.eql(firstName);
  });
});
