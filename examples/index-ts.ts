process.env.DEBUG = 'redis';
import { createLogger } from '../dist';

const mongoLogger = createLogger('mongo');
const redisLogger = createLogger('redis');

// simple info logging with enabled namespace
redisLogger.info('connected', { domain: 'yahoo' });

// not enabled
mongoLogger.info('connected', { domain: 'google' });

// error objects
redisLogger.fromError('query', new Error('Unauthorized'), { problem: 'missmatch' });

// displays as is
console.log(JSON.stringify({ example: 'output' }));
