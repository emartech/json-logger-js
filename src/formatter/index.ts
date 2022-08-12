import { jsonFormatter } from './json';
import { logentriesFormatter } from './logentries';
import { debugFormatter } from './debug';

export const formatter = {
  json: jsonFormatter,
  debug: debugFormatter,
  logentries: logentriesFormatter
};
