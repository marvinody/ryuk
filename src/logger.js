const { createLogger, format, transports } = require('winston')

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    // format.splat(),
    // format.simple()
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}` + (info.splat !== undefined ? `${info.splat}` : " "))
    // format.json()
  ),
  transports: [
    new transports.Console({
      timestamp: true,
    }),
  ]
});

module.exports = logger
