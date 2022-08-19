import { ColorName } from '../output/color-name/color-name';
import { stringifyLevel } from '../output/stringify-level/stringify-level';
import { FormatTime } from '../output/format-time/format-time';
import { formatBody } from '../output/format-body/format-body';

interface Log {
  name: string;
  level: string;
}

const formatTime = new FormatTime();
export function debugFormatter(log: Log) {
  return [
    ColorName.addColor(log.name),
    stringifyLevel(log.level),
    formatTime.elapsedTime(),
    formatBody(log)
  ].join(' ');
};
