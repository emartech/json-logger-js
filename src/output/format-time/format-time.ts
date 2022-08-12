export class FormatTime {
  lastLog = 0;

  elapsedTime() {
    const current = this.getCurrentTime();
    let elapsed = 0;

    if (this.lastLog) {
      elapsed = current - this.lastLog;
    }

    this.lastLog = current;
    return '+' + elapsed + 'ms';
  }

  getCurrentTime() {
    return new Date().getTime();
  }
}
