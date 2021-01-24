import {createLogger, format, transports} from 'winston';
import path from 'path';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({stack: true}),
    // format.splat(),
    // format.simple()
    format.printf(
      info =>
        `${info.timestamp} ${info.level}: ${info.message}` +
        (info.splat !== undefined ? `${info.splat}` : ' ')
    )
    // format.json()
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: path.join(__dirname, '..', 'logs', 'combined.log'),
      maxFiles: 10,
      maxsize: 500 * 1024, // 500kb per log file
      zippedArchive: true,
      tailable: true,
    }),
  ],
});

export default logger;
