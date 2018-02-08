# json-logger-js

Simple JSON logger middleware that combines the namespaces of [debug] and the
 machine readable JSON format of [bunyan].

It has the same logging levels as [bunyan].

## Example logging

```javascript
process.env.DEBUG = 'redis';
const mongoLogger = require('@emartech/json-logger')('mongo');
const redisLogger = require('@emartech/json-logger')('redis');

// simple info logging with enabled namespace
redisLogger.info('connected', { domain: 'yahoo' });

// not enabled
mongoLogger.info('connected', { domain: 'google' });

// error objects
redisLogger.fromError('query', new Error('Unauthorized'), { problem: 'missmatch' });
```

will output

```
{"name":"redis","action":"connected","level":30,"time":"2016-08-15T08:50:23.566Z","domain":"yahoo"}
{"name":"redis","action":"query","level":50,"time":"2016-08-15T08:50:23.569Z","error_name":"Error","error_stack":"Error: Unauthorized\n    at Object.<anonymous> (/home/blacksonic/workspace/bunyan-debug/example.js:15:32)\n    at Module._compile (module.js:541:32)\n    at Object.Module._extensions..js (module.js:550:10)\n    at Module.load (module.js:458:32)\n    at tryModuleLoad (module.js:417:12)\n    at Function.Module._load (module.js:409:3)\n    at Module.runMain (module.js:575:10)\n    at run (bootstrap_node.js:352:7)\n    at startup (bootstrap_node.js:144:9)\n    at bootstrap_node.js:467:3","error_message":"Unauthorized","problem":"missmatch"}
```

Examples can be found in ```examples/index.js```.

### Logging request identifier automatically

The continuation local storage handling has moved to the `@emartech/cls-adapter` package.
You need to use the middlewares of `@emartech/cls-adapter` and add its transformer to the loggers configure method.
This way it will log the request identifier coming from the header field (`X-Request-Id`).

For automatting 

```javascript
const Koa = require('koa');
const logFactory = require('@emartech/json-logger');
const clsAdapter = require('@emartech/cls-adapter');

logFactory.configure({
  transformers: [
    clsAdapter.addContextStorageToInput()
  ]
});

const app = new Koa();
app.use(clsAdapter.getKoaMiddleware());
```

## Development

While developing JSON is not the most readable format. To solve this a little
 command line formatter is also included which is very familiar to [debug]'s
 output format.

```
redis INFO +0ms action="connected" domain="yahoo"
redis ERROR +2ms action="query" error_message="Unauthorized" error_name="Error" error_stack="Error: Unauthorized\n    at Object.<anonymous> (/home/blacksonic/workspace/bunyan-debug/example.js:15:32)\n    at Module._compile (module.js:541:32)\n    at Object.Module._extensions..js (module.js:550:10)\n    at Module.load (module.js:458:32)\n    at tryModuleLoad (module.js:417:12)\n    at Function.Module._load (module.js:409:3)\n    at Module.runMain (module.js:575:10)\n    at run (bootstrap_node.js:352:7)\n    at startup (bootstrap_node.js:144:9)\n    at bootstrap_node.js:467:3" problem="missmatch"
```

[debug]: https://github.com/visionmedia/debug
[bunyan]: https://github.com/trentm/node-bunyan
