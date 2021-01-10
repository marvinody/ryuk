const { createLogger, format, transports } = require('winston')
const path = require('path')

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
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
    new transports.File({
      filename: path.join(__dirname, '..', 'logs', 'combined.log'),
      maxFiles: 10,
      maxsize: 500 * 1024, // 500kb per log file
      zippedArchive: true,
      tailable: true,
    }),
  ]
});

module.exports = logger
