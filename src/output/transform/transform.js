'use strict';

const colorName = require('../color-name/color-name');
const stringifyLevel = require('../stringify-level/stringify-level');
const formatTime = require('../format-time/format-time');
const formatBody = require('../format-body/format-body');

module.exports = function(line) {
  let transformedLine;
  if (line.length) {
    try {
      const data = JSON.parse(line);

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
