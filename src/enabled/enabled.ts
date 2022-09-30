export const isNamespaceEnabled = (availableNamespace: string, namespace: string) => {
  const availableNamespaces = availableNamespace.split(/[\s,]+/);
  let enabled = false;
  const adds: RegExp[] = [];
  const skips: RegExp[] = [];

  availableNamespaces.forEach((name) => {
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

  adds.forEach((addRegexp) => {
    if (addRegexp.test(namespace)) {
      enabled = true;
    }
  });

  skips.forEach((addRegexp) => {
    if (addRegexp.test(namespace)) {
      enabled = false;
    }
  });

  return enabled;
};
