'use strict';

const Koa = require('koa');
const logFactory = require('./index');
const logger = logFactory('example');
const port = 3000;

const app = new Koa();

app.use(async (ctx, next) => {
  ctx.request.header['x-request-id'] = 'uuid';
  await next();
});
app.use(logFactory.getMiddleware());
app.use(async () => {
  logger.info('works');
});

app.listen(port);
console.log('listening on port: ' + port);