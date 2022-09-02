const express = require('express');
const { createLogger } = require('../dist');
const clsAdapter = require('@emartech/cls-adapter');
const logger = createLogger('example');
const port = 3000;

createLogger.configure({
  transformers: [
    clsAdapter.addContextStorageToInput()
  ]
});
const app = express();

app.use(clsAdapter.getExpressMiddleware());

app.get('/', (req, res) => {
  logger.info('before');

  clsAdapter.setOnContext('customer_id', Math.round(Math.random() * 1000));

  logger.info('after');
  res.send('It works')
});

app.listen(port);
console.log('listening on port: ' + port);
