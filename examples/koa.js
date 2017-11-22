'use strict';

const Koa = require('koa');
const logFactory = require('../index');
const logger = logFactory('example');
const port = 3000;

const app = new Koa();

app.use(logFactory.getMiddleware());

app.use(async (ctx) => {
  logger.info('before');

  logFactory.setOnContext('customer_id', Math.round(Math.random() * 1000));

  logger.info('after');
  ctx.body = 'It works';
});

app.listen(port);
console.log('listening on port: ' + port);
