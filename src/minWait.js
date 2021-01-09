const logger = require('./logger')

const delay = (ms) => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res()
    }, ms)
  });
}
module.exports = (cb, minTimeBetweenCb) => {
  let lastCallTS = 0;

  return async (...args) => {
    const now = Date.now()
    const diff = now - lastCallTS
    if (diff < minTimeBetweenCb) {
      const toWait = minTimeBetweenCb - diff
      logger.debug(`MINWAIT: waiting ${toWait} ms between calls`)
      await delay(toWait)
    }
    const result = await cb(...args)
    lastCallTS = Date.now()

    return result
  }
}
