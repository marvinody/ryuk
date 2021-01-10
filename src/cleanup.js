const logger = require('./logger')

const noOp = () => { }

module.exports = function Cleanup(callback) {

  // attach user callback to the process event emitter
  // if no callback, it will still exit gracefully on Ctrl-C
  callback = callback || noOp;
  process.on('cleanup', callback);

  // do app specific cleaning before exiting
  process.on('exit', function () {
    process.emit('cleanup');
  });

  // catch ctrl+c event and exit normally
  process.on('SIGINT', function () {
    logger.info("Terminated early, cleaing up")
    process.exit(2);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('uncaughtException', function (e) {
    logger.error("UNCAUGHT EXCEPTION", e)
    process.exit(99);
  });

  //catch uncaught exceptions, trace, then exit normally
  process.on('unhandledRejection', function (e) {
    logger.error(`UNCAUGHT REJECT: ${e.message}`,)
    logger.error(e)
    process.exit(99);
  });
};
