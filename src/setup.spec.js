'use strict';
let sinon = require('sinon');
let chai = require('chai');
let sinonChai = require('sinon-chai');
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
