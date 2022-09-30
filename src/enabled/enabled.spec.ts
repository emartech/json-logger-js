import { isNamespaceEnabled } from './enabled';
import { expect } from 'chai';

describe('isNamespaceAvailable', () => {
  it('should enable when variables only contain one', () => {
    expect(isNamespaceEnabled('mongo', 'mongo')).to.eql(true);
  });

  it('should disable when not in availables', () => {
    expect(isNamespaceEnabled('mongo', 'redis')).to.eql(false);
  });

  it('should enable when part of available and available contains *', () => {
    expect(isNamespaceEnabled('mongo*', 'mongolab')).to.eql(true);
  });

  it('should allow multiple available namespaces', () => {
    const availableNamespaces = 'mongo,redis';

    expect(isNamespaceEnabled(availableNamespaces, 'mongo')).to.eql(true);
    expect(isNamespaceEnabled(availableNamespaces, 'redis')).to.eql(true);
  });

  it('should disable names starting with -', () => {
    expect(isNamespaceEnabled('mongo*,-*lab', 'mongolab')).to.eql(false);
  });

  it('should not work with empty strings', () => {
    expect(isNamespaceEnabled('', '')).to.eql(false);
  });

  it('should enable everything for star', () => {
    expect(isNamespaceEnabled('*', 'mongo')).to.eql(true);
  });
});
