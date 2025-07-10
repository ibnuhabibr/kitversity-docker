// Professional logging system
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  meta?: any;
  requestId?: string;
  userId?: string;
}

class Logger {
  private logLevel: LogLevel;
  private logDir: string;

  constructor() {
    this.logLevel = process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
    this.logDir = join(process.cwd(), 'logs');
    
    // Ensure log directory exists
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  private writeLog(entry: LogEntry) {
    const logLine = JSON.stringify(entry) + '\n';
    
    // Console output
    console.log(`[${entry.timestamp}] ${entry.level}: ${entry.message}`, entry.meta || '');
    
    // File output (only in production)
    if (process.env.NODE_ENV === 'production') {
      const today = new Date().toISOString().split('T')[0];
      const logFile = join(this.logDir, `app-${today}.log`);
      
      try {
        writeFileSync(logFile, logLine, { flag: 'a' });
      } catch (error) {
        console.error('Failed to write log file:', error);
      }
    }
  }

  private log(level: LogLevel, levelName: string, message: string, meta?: any, requestId?: string, userId?: string) {
    if (level <= this.logLevel) {
      this.writeLog({
        timestamp: new Date().toISOString(),
        level: levelName,
        message,
        meta,
        requestId,
        userId
      });
    }
  }

  error(message: string, meta?: any, requestId?: string, userId?: string) {
    this.log(LogLevel.ERROR, 'ERROR', message, meta, requestId, userId);
  }

  warn(message: string, meta?: any, requestId?: string, userId?: string) {
    this.log(LogLevel.WARN, 'WARN', message, meta, requestId, userId);
  }

  info(message: string, meta?: any, requestId?: string, userId?: string) {
    this.log(LogLevel.INFO, 'INFO', message, meta, requestId, userId);
  }

  debug(message: string, meta?: any, requestId?: string, userId?: string) {
    this.log(LogLevel.DEBUG, 'DEBUG', message, meta, requestId, userId);
  }

  // Specific logging methods
  apiRequest(method: string, url: string, statusCode: number, duration: number, requestId: string, userId?: string) {
    this.info(`API ${method} ${url} - ${statusCode} (${duration}ms)`, {
      method,
      url,
      statusCode,
      duration
    }, requestId, userId);
  }

  dbQuery(query: string, duration: number, requestId?: string) {
    this.debug(`DB Query executed (${duration}ms)`, { query, duration }, requestId);
  }

  security(event: string, details: any, requestId?: string, userId?: string) {
    this.warn(`Security Event: ${event}`, details, requestId, userId);
  }
}

export const logger = new Logger();