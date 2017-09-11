# json-logger-js

Simple JSON logger middleware that combines the namespaces of [debug] and the
 machine readable JSON format of [bunyan].

It has the same logging levels as [bunyan].

## Example

```javascript
process.env.DEBUG = 'redis';
let mongoLogger = require('bunyan-debug')('mongo');
let redisLogger = require('bunyan-debug')('redis');

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

Examples can be found in ```example.js```.

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
