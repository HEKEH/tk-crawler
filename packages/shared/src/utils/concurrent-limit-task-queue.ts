interface QueueItem<T = any> {
  task: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
}

/** 并发数限制 */
export class ConcurrentLimitTaskQueue {
  private _limit: number;

  private _running = 0;

  private _queue: QueueItem[] = [];

  constructor(limit: number) {
    this._limit = limit;
  }

  addTask<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this._queue.push({ task, resolve, reject });
      this._runNext();
    });
  }

  private _runNext() {
    if (this._running >= this._limit) {
      return;
    }

    const item = this._queue.shift();
    if (!item) {
      return;
    }

    this._running++;
    item
      .task()
      .then(result => {
        item.resolve(result);
      })
      .catch(error => {
        item.reject(error);
      })
      .finally(() => {
        this._running--;
        this._runNext();
      });
  }

  clear(): void {
    // 清空队列中的所有任务
    while (this._queue.length > 0) {
      const item = this._queue.shift();
      if (item) {
        item.reject(new Error('Task cancelled: queue was cleared'));
      }
    }
  }
}
