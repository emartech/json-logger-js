# @emartech/json-logger

A tiny and fast logging library that outputs logs in JSON format.
It has the same namespace based enabling/disabling mechanism as [debug]
and has the same log levels as [bunyan].

### Installation

```bash
npm install @emartech/json-logger
```

### Usage

```javascript
process.env.DEBUG = 'redis';
const mongoLogger = require('@emartech/json-logger')('mongo');
const redisLogger = require('@emartech/json-logger')('redis');

redisLogger.info('connected', { domain: 'yahoo' });
// {"name":"redis","action":"connected","level":30,"time":"2016-08-15T08:50:23.566Z","domain":"yahoo"}

mongoLogger.info('connected', { domain: 'google' });
// no output, because 'mongo' is not within namespaces (process.env.DEBUG)

redisLogger.fromError('query', new Error('Unauthorized'), { problem: 'missmatch' });
// {"name":"redis","action":"query","level":50,"time":"2016-08-15T08:50:23.569Z","error_name":"Error","error_stack":"Error: Unauthorized\n    at Object.<anonymous> (/home/blacksonic/workspace/bunyan-debug/example.js:15:32)\n    at Module._compile (module.js:541:32)\n    at Object.Module._extensions..js (module.js:550:10)\n    at Module.load (module.js:458:32)\n    at tryModuleLoad (module.js:417:12)\n    at Function.Module._load (module.js:409:3)\n    at Module.runMain (module.js:575:10)\n    at run (bootstrap_node.js:352:7)\n    at startup (bootstrap_node.js:144:9)\n    at bootstrap_node.js:467:3","error_message":"Unauthorized","problem":"missmatch"}
```

More examples can be found in the `examples` directory.

### API

##### JsonLogger(namespace)

The default export of the library acts as a factory method.
Returns a logging instance with the given namespace.
The `DEBUG` environment variable is then used to enable these instances based on comma-delimited names.
Disabled instances output no logs.

```javascript
process.env.DEBUG = 'redis,mysql';

const mongoLogger = require('@emartech/json-logger')('mongo');
// mongo instance will be disabled

const redisLogger = require('@emartech/json-logger')('redis');
// redis instance will be enabled
```

##### JsonLogger.prototype.info(action, data)

Prints the provided data to the console in JSON format.

```javascript
const redisLogger = require('@emartech/json-logger')('redis');

redisLogger.info('connected', { domain: 'yahoo' });
// {"name":"redis","action":"connected","level":30,"time":"2016-08-15T08:50:23.566Z","domain":"yahoo"}

redisLogger.info('connected');
// {"name":"redis","action":"connected","level":30,"time":"2016-08-15T08:50:23.566Z"}
```

By default displays the namespace of the instance (`name`), the current time in ISO8601 format (`time`),
the action passed to the log method and the log level associated with the method.
The second argument is assigned to these basic fields and is displayed along with them.

##### JsonLogger.prototype.trace(action, data)

Same as info with trace log level.

##### JsonLogger.prototype.debug(action, data)

Same as info with debug log level.

##### JsonLogger.prototype.warn(action, data)

Same as info with warn log level.

##### JsonLogger.prototype.error(action, data)

Same as info with error log level.

##### JsonLogger.prototype.fatal(action, data)

Same as info with fatal log level.

##### JsonLogger.prototype.fromError(action, data)

Displays an error object which formatted to fit into one line.
The displayed line contains the stack trace, the name and the message of the error (for Axios errors, also request and response details).
The log level defaults to error.

```javascript
const redisLogger = require('@emartech/json-logger')('redis');

redisLogger.fromError('query', new Error('Unauthorized'), { problem: 'missmatch' });
// {"name":"redis","action":"query","level":50,"time":"2016-08-15T08:50:23.569Z","error_name":"Error","error_stack":"Error: Unauthorized\n    at Object.<anonymous> (/home/blacksonic/workspace/bunyan-debug/example.js:15:32)\n    at Module._compile (module.js:541:32)\n    at Object.Module._extensions..js (module.js:550:10)\n    at Module.load (module.js:458:32)\n    at tryModuleLoad (module.js:417:12)\n    at Function.Module._load (module.js:409:3)\n    at Module.runMain (module.js:575:10)\n    at run (bootstrap_node.js:352:7)\n    at startup (bootstrap_node.js:144:9)\n    at bootstrap_node.js:467:3","error_message":"Unauthorized","problem":"missmatch"}
```

##### JsonLogger.prototype.warnFromError(action, data)

Same as `fromError`, but with warn log level.

##### JsonLogger.prototype.timer()

Creates a new instance of timer that has the same methods as the logging instance (info, warn, error, fromError etc.)
but also logs the elapsed time in milliseconds from the creation of the instance.
The elapsed time will be logged into the `duration` field.

```javascript
const redisLogger = require('@emartech/json-logger')('redis');

const timer = redisLogger.timer();

// heavy task

timer.info('completed');
// {"name":"redis","action":"completed","level":30,"time":"2016-08-15T08:50:23.566Z","duration": 1500}
```

##### JsonLogger.configure(options)

The separate steps of the logging process can be configured here.
These modifications affect all the instances of the library.
With transformers we can alter the data to be logged before passing to the formatter and then to the output.
It is a perfect place to add the name of the machine is running on or the request id associated with the current thread stored on a continuation local storage. 

```javascript
const Logger = require('@emartech/json-logger');

Logger.configure({
  formatter: JSON.stringify,
  output: console.log,
  transformers: []
});

```

### Log levels

- "fatal" (60): The service/app is going to stop or become unusable now.
  An operator should definitely look into this soon.
- "error" (50): Fatal for a particular request, but the service/app continues
  servicing other requests. An operator should look at this soon(ish).
- "warn" (40): A note on something that should probably be looked at by an
  operator eventually.
- "info" (30): Detail on regular operation.
- "debug" (20): Anything else, i.e. too verbose to be included in "info" level.
- "trace" (10): Logging from external libraries used by your app or *very*
  detailed application logging.

### Logging request identifier automatically

You need to use the middlewares of `@emartech/cls-adapter` and add its transformer to the logger's configure method.
This way it will log the request identifier coming from the header field (`X-Request-Id`) to every log line 
where the called function is originating from the route handler.

For automating 

```javascript
const Koa = require('koa');
const logFactory = require('@emartech/json-logger');
const clsAdapter = require('@emartech/cls-adapter');
const logger = logFactory('redis');

logFactory.configure({
  transformers: [
    clsAdapter.addContextStorageToInput()
  ]
});

const app = new Koa();
app.use(clsAdapter.getKoaMiddleware());

app.use(async () => {
  logger.info('connected');
  // {"name":"redis","action":"connected","level":30,"time":"2016-08-15T08:50:23.566Z","request_id":"d5caaa0e-b04e-4d94-bc88-3ed3b62dc94a"}
})
```

[debug]: https://github.com/visionmedia/debug
[bunyan]: https://github.com/trentm/node-bunyan
