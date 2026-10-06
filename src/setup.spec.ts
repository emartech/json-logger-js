import chai from 'chai';
import { afterEach } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

afterEach(() => {
  sinon.restore();
});
