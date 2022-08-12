'use strict';

// @ts-ignore
export function formatBody(logBody) {
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

  const keys = Object.keys(log);

  return keys
    .sort()
    .map(function(key) {
      return key + '=' + JSON.stringify(log[key]);
    })
    .join(' ');
}
