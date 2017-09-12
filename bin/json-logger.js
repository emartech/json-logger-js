#! /usr/bin/env node
'use strict';

const eventStream = require('event-stream');
const transformLine = require('../src/output/transform/transform');

process.stdin.setEncoding('utf8');
process.stdin
  .pipe(eventStream.split())
  .pipe(eventStream.mapSync(transformLine))
  .pipe(process.stdout);
