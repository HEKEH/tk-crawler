interface QueueItem<T = any> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

/** 频率限制 */
export class FrequencyLimitTaskQueue {
  /** 每分钟频率限制 */
  private _limit: number;
  private _onlyOneTask: boolean;

  private _taskInterval?: number;
  /** 记录最近一分钟内的任务执行时间戳 */
  private _timestamps: number[] = [];
  private _queue: QueueItem[] = [];
  private _isProcessing = false;
  private _currentlyRunning = false;

  constructor(props: {
    frequencyLimit: number;
    onlyOneTask: boolean;
    taskInterval?: number;
  }) {
    this._limit = props.frequencyLimit;
    this._onlyOneTask = props.onlyOneTask;
    this._taskInterval = props.taskInterval;
  }

  addTask<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this._queue.push({ task, resolve, reject });
      this._processQueue();
    });
  }

  clear() {
    this._queue = [];
    this._timestamps = [];
    this._isProcessing = false;
    this._currentlyRunning = false;
  }

  private _cleanOldTimestamps() {
    const oneMinuteAgo = Date.now() - 60000;
    let i = 0;
    while (i < this._timestamps.length && this._timestamps[i] <= oneMinuteAgo) {
      i++;
    }
    if (i > 0) {
      this._timestamps = this._timestamps.slice(i);
    }
  }

  private async _processQueue() {
    if (this._isProcessing) {
      return;
    }
    this._isProcessing = true;

    while (this._queue.length > 0) {
      this._cleanOldTimestamps();

      if (this._timestamps.length >= this._limit) {
        // 等待到下一个可执行时间
        const oldestTimestamp = this._timestamps[0];
        const waitTime = Math.max(0, oldestTimestamp + 60000 - Date.now());
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // 在 onlyOneTask 模式下，等待当前任务完成
      if (this._onlyOneTask && this._currentlyRunning) {
        await new Promise(resolve => setTimeout(resolve, 100));
        continue;
      }

      const item = this._queue.shift();
      if (!item) {
        break;
      }

      this._timestamps.push(Date.now());
      this._currentlyRunning = true;

      try {
        const result = await item.task();
        item.resolve(result);
      } catch (error) {
        item.reject(error);
      } finally {
        if (this._taskInterval) {
          await new Promise(resolve => setTimeout(resolve, this._taskInterval));
        }
        this._currentlyRunning = false;
      }
    }

    this._isProcessing = false;
  }
}
