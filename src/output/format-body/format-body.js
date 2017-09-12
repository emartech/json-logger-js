'use strict';

module.exports = function(logBody) {
  const log = Object.assign({}, logBody);

  delete log.name;
  delete log.level;
  delete log.v;
  delete log.pid;
  delete log.hostname;
  delete log.time;

  if (!log.msg) {
    delete log.msg;
  }

  let keys = Object.keys(log);

  return keys
    .sort()
    .map(function(key) {
      return key + '=' + JSON.stringify(log[key]);
    })
    .join(' ');
};
