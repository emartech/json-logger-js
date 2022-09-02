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
    name: 'WARN'
  },
  error: {
    number: 50,
    name: 'ERROR'
  },
  fatal: {
    number: 60,
    name: 'FATAL'
  }
};

const availableLevels = Object.keys(levels);

export const config = { levels, availableLevels };
