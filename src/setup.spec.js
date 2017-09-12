'use strict';

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
global.expect = require('chai').expect;

chai.use(sinonChai);
global.expect = chai.expect;

beforeEach(function () {
  this.sandbox = sinon.sandbox.create();
});

afterEach(function () {
  this.sandbox.restore();
  this.sandbox = undefined;
});
