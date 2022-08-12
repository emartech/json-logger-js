import chalk from 'chalk';
const colors = ['cyan', 'magenta', 'grey', 'blue', 'green', 'yellow', 'white', 'red'];

interface Color {
  color: number;
}

export class ColorName {
  static counter = 0;
  static colors = colors;
  static names: Record<string, Color> = {};

  static addColor(name: string) {
    if (!this.names[name]) {
      this.names[name] = { color: this.counter % colors.length };
      this.counter++;
    }

    const color = colors[this.names[name].color];
    // @ts-ignore
    return chalk[color](name);
  }

  static reset() {
    this.counter = 0;
    this.names = {};
  }
}
