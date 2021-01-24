import logger from './logger';

const delay = (ms: number) => {
  return new Promise(res => {
    setTimeout(() => {
      res(null);
    }, ms);
  });
};

export default (minTimeBetweenCb: number) => {
  return (
    target: Object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    let lastCallTS = 0;
    const cb = descriptor.value;

    descriptor.value = async (...args: any[]) => {
      const now = Date.now();
      const diff = now - lastCallTS;
      if (diff < minTimeBetweenCb) {
        const toWait = minTimeBetweenCb - diff;
        logger.debug(`MINWAIT: waiting ${toWait} ms between calls`);
        await delay(toWait);
      }
      const result = await cb.apply(target, args);
      lastCallTS = Date.now();

      return result;
    };
    return descriptor;
  };
};
