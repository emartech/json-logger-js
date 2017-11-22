'use strict';

process.env.DEBUG = 'redis';
const logger = require('../index');

const mongoLogger = logger('mongo');
const redisLogger = logger('redis');

// simple info logging with enabled namespace
redisLogger.info('connected', { domain: 'yahoo' });

// not enabled
mongoLogger.info('connected', { domain: 'google' });

// error objects
redisLogger.fromError('query', new Error('Unauthorized'), { problem: 'missmatch' });

// displays as is
console.log(JSON.stringify({ example: 'output' }));
