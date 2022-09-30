const isNumeric = (value: unknown) => !isNaN(parseFloat(value as string)) && isFinite(value as number);

const isString = (value: unknown) => typeof value === 'string' || value instanceof String;

const convertToTag = (value: unknown, key: string) => {
  if (isString(value)) {
    value = JSON.stringify(value);
  } else if (isNumeric(value)) {
    value = (value as number).toString();
  } else {
    value = '"' + JSON.stringify(value) + '"';
  }

  return key + '=' + value;
};

export const logentriesFormatter = (data: Record<string, unknown>) => {
  return Object.keys(data)
    .map((key) => convertToTag(data[key], key))
    .join(' ');
};
