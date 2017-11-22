'use strict';

const express = require('express');
const logFactory = require('../index');
const logger = logFactory('example');
const port = 3000;

const app = express();

app.use(logFactory.getExpressMiddleware());

app.get('/', (req, res) => {
  logger.info('before');

  logFactory.setOnContext('customer_id', Math.round(Math.random() * 1000));

  logger.info('after');
  res.send('It works')
});

app.listen(port);
console.log('listening on port: ' + port);
