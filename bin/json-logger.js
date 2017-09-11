#! /usr/bin/env node
'use strict';
let eventStream = require('event-stream');
let transformLine = require('../src/output/transform/transform');

process.stdin.setEncoding('utf8');
process.stdin
  .pipe(eventStream.split())
  .pipe(eventStream.mapSync(transformLine))
  .pipe(process.stdout);
