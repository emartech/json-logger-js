'use strict';

const isNumeric = (value) => !isNaN(parseFloat(value)) && isFinite(value);

const isString = (value) => typeof value === 'string' || value instanceof String;

const convertToTag = (value, key) => {
  if (isString(value)) {
    value = JSON.stringify(value);
  } else if(isNumeric(value)) {
    value = value.toString();
  } else {
    value = '"' + JSON.stringify(value) + '"';
  }

  return key + '=' + value;
};

module.exports = function(data) {
  return Object
    .keys(data)
    .map(key => convertToTag(data[key], key))
    .join(' ');
};
