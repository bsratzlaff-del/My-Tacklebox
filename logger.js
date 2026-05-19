import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    // 1. Write all system errors to error.log
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    // 2. Write everything to combined.log
    new winston.transports.File({ filename: 'logs/combined.log' })
  ],
  // Catch fatal crashes and force them to the file
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/error.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/error.log' })
  ]
});

// Also print to console so 'kubectl logs' still works
logger.add(new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
}));

export default logger;