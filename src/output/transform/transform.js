'use strict';
let colorName = require('../color-name/color-name');
let stringifyLevel = require('../stringify-level/stringify-level');
let formatTime = require('../format-time/format-time');
let formatBody = require('../format-body/format-body');

module.exports = function(line) {
  let transformedLine;
  if (line.length) {
    try {
      let data = JSON.parse(line);

      if (data.hasOwnProperty('name')) {
        transformedLine = [
          colorName(data.name),
          stringifyLevel(data.level),
          formatTime.elapsedTime(data.time),
          formatBody(data)
        ].join(' ');
      }
      else {
        transformedLine = line;
      }
    }
    catch (e) {
      transformedLine = line;
    }
  }
  else {
    transformedLine = line;
  }

  return transformedLine + '\n';
};
