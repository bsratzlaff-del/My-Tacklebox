import winston from 'winston';
import fs from 'fs'; 
import path from 'path';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error', maxsize: 5242880 }),
    new winston.transports.File({ filename: path.join(logDir, 'combined.log'), maxsize: 5242880 })
  ],
  exceptionHandlers: [new winston.transports.File({ filename: path.join(logDir, 'error.log') })],
  rejectionHandlers: [new winston.transports.File({ filename: path.join(logDir, 'error.log') })]
});

// 🛠️ FIXED: Removed winston.format.colorize() so the text is raw, clean plain text.
// This allows PowerShell to match strings and read emojis perfectly without ANSI corruption.
logger.add(new winston.transports.Console({
  format: winston.format.simple()
}));

export default logger;