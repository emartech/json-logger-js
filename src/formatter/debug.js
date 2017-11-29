'use strict';

const ColorName = require('../output/color-name/color-name');
const stringifyLevel = require('../output/stringify-level/stringify-level');
const formatTime = require('../output/format-time/format-time');
const formatBody = require('../output/format-body/format-body');

module.exports = function(log) {
  return [
    ColorName.addColor(log.name),
    stringifyLevel(log.level),
    formatTime.elapsedTime(log.time),
    formatBody(log)
  ].join(' ');
};
