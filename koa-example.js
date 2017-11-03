'use strict';

const Koa = require('koa');
const uuid = require('uuid');
const logFactory = require('./index');
const logger = logFactory('example');
const port = 3000;

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.request.header['x-request-id'] = uuid.v4();
  await next();
});

app.use(logFactory.getMiddleware());

app.use(async (ctx) => {
  logger.info('before');

  logFactory.setOnContext('customer_id', Math.round(Math.random() * 1000));

  logger.info('after');
  ctx.body = 'It works';
});

app.listen(port);
console.log('listening on port: ' + port);
