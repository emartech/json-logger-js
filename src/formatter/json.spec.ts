import { expect } from 'chai';
import { jsonFormatter } from './json';

describe('json formatter', () => {
  it('should stringify object to json', () => {
    expect(jsonFormatter({ name: 'debugger' })).to.eql('{"name":"debugger"}');
  });
});
