import chalk from 'chalk';

interface Color {
  number: number;
  name: string;
}

const levels: Record<string, Color> = {
  trace: {
    number: 10,
    name: 'TRACE'
  },
  debug: {
    number: 20,
    name: 'DEBUG'
  },
  info: {
    number: 30,
    name: 'INFO'
  },
  warn: {
    number: 40,
    name: chalk.yellow('WARN')
  },
  error: {
    number: 50,
    name: chalk.red('ERROR')
  },
  fatal: {
    number: 60,
    name: chalk.red('FATAL')
  }
};

const availableLevels = Object.keys(levels);

const coloredNames: Record<string, string> = {};
availableLevels.forEach((levelName) => {
  coloredNames[levels[levelName].number] = levels[levelName].name;
});

export const config = { levels, availableLevels, coloredNames };
