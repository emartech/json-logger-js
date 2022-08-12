import { config } from '../../config';

export function stringifyLevel(level: string) {
  return config.coloredNames[level];
}
