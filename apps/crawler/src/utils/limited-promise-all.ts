export async function limitedPromiseAll<T>(
  promiseFuncs: (() => Promise<T>)[],
  limit: number,
) {
  return new Promise((resolve, reject) => {
    let running = 0;
    let index = 0;
    const results: T[] = [];
    const runNext = () => {
      if (index >= promiseFuncs.length) {
        if (running === 0) {
          resolve(results);
        }
        return;
      }

      const currentIndex = index++;
      const promise = promiseFuncs[currentIndex]();
      running++;

      promise
        .then(result => {
          results[currentIndex] = result;
          running--;
          runNext();
        })
        .catch(error => {
          reject(error);
        });
    };

    for (let i = 0; i < Math.min(limit, promiseFuncs.length); i++) {
      runNext();
    }
  });
}
