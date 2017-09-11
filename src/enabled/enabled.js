'use strict';

function isNamespaceEnabled(availableNamespaces, namespace) {
  availableNamespaces = availableNamespaces.split(/[\s,]+/);
  let enabled = false;
  let adds = [];
  let skips = [];

  availableNamespaces.forEach(function(name) {
    if (!name) {
      return;
    }

    name = name.replace(/\*/g, '.*?');
    if (name[0] === '-') {
      skips.push(new RegExp('^' + name.substr(1) + '$'));
    } else {
      adds.push(new RegExp('^' + name + '$'));
    }
  });

  adds.forEach(function(addRegexp) {
    if (addRegexp.test(namespace)) {
      enabled = true;
    }
  });

  skips.forEach(function(addRegexp) {
    if (addRegexp.test(namespace)) {
      enabled = false;
    }
  });

  return enabled;
}

module.exports = isNamespaceEnabled;
