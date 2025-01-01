/** 定时执行器，上一轮完全结束后，再执行下一轮 */

export class IntervalRunner {
  private _intervalTime: number = 0;
  private _timeout: NodeJS.Timeout | null = null;
  private _callback: (() => Promise<void>) | null = null;
  constructor() {}

  private async _run() {
    if (!this._callback) {
      return;
    }
    const startTime = Date.now();
    await this._callback();
    const endTime = Date.now();
    const intervalTime = endTime - startTime;
    if (intervalTime < this._intervalTime) {
      setTimeout(() => {
        this._run();
      }, this._intervalTime - intervalTime);
    } else {
      this._run();
    }
  }

  start(
    callback: () => Promise<void>,
    options: { immediate?: boolean; intervalTime: number },
  ) {
    this.stop();
    this._intervalTime = options.intervalTime;
    this._callback = callback;
    if (options.immediate) {
      this._run();
    } else {
      this._timeout = setTimeout(() => {
        this._run();
      }, options.intervalTime);
    }
  }

  stop() {
    this._intervalTime = 0;
    this._callback = null;
    if (this._timeout) {
      clearInterval(this._timeout);
      this._timeout = null;
    }
  }
}
