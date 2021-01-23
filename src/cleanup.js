/* eslint-disable no-process-exit */
const logger = require('./logger');

const noOp = () => {};

module.exports = function Cleanup(callback) {
  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;
  process.on('cleanup', callback);

  // do app specific cleaning before exiting
  process.on('exit', () => {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', () => {
    logger.info('Terminated early, cleaing up');
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', e => {
    logger.error('UNCAUGHT EXCEPTION', e);
    process.exit(99);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('unhandledRejection', e => {
    logger.error(`UNCAUGHT REJECT: ${e.message}`);
    logger.error(e);
    process.exit(99);
  });
};
