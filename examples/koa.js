'use strict';

const Koa = require('koa');
const logFactory = require('../index');
const clsAdapter = require('@emartech/cls-adapter');
const logger = logFactory('example');
const port = 3000;

logFactory.configure({
  transformers: [
    clsAdapter.addContextStorageToInput()
  ]
});
const app = new Koa();

app.use(clsAdapter.getKoaMiddleware());

app.use(async (ctx) => {
  logger.info('before');

  clsAdapter.setOnContext('customer_id', Math.round(Math.random() * 1000));

  logger.info('after');
  ctx.body = 'It works';
});

app.listen(port);
console.log('listening on port: ' + port);
