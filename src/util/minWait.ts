import logger from './logger';
import delay from './delay';

export const waitBetweenCalls = <T extends (...args: any[]) => any>(
  waitTime: number
) => (fn: T) => {
  type resolveFn = (arg: Promise<any>) => void;
  type waitingFn = () => void;
  let queue: waitingFn[] = [];
  let activeCount = 0;
  let lastCallTS = 0;

  const dequeue = () => {
    const pendingFn = queue[0];
    queue = queue.slice(1);
    return pendingFn;
  };

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      dequeue()();
    }
  };

  const run = async (resolve: resolveFn, ...args: Parameters<T>) => {
    activeCount++;
    const now = Date.now();
    const diff = now - lastCallTS;
    if (diff < waitTime) {
      const toWait = waitTime - diff;
      logger.debug(`MINWAIT: waiting ${toWait} ms between calls`);
      await delay(toWait);
    }

    const result: Promise<ReturnType<T>> = (async () => fn(...args))();

    resolve(result);

    try {
      await result;
    } catch (err) {
      logger.error(err);
    }
    lastCallTS = Date.now();
    next();
  };

  const enqueue = (resolve: resolveFn, ...args: Parameters<T>) => {
    queue.push(() => run(resolve, ...args));

    (async () => {
      // This function needs to wait until the next microtask before comparing
      // `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
      // when the run function is dequeued and called. The comparison in the if-statement
      // needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
      await Promise.resolve();

      if (activeCount < 1 && queue.length > 0) {
        dequeue()();
      }
    })();
  };

  const generator = (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise(resolve => {
      enqueue(resolve, ...args);
    });
  };

  return generator;
};
