/**
 * Logging service for the application
 * Provides structured logging with different levels and environments
 */

/**
 * Log levels for filtering log output
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

/**
 * Structure of a log entry
 */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
  context?: string;
}

/**
 * Singleton logger class that provides structured logging
 * with different levels and environment-aware output
 */
class Logger {
  private static instance: Logger;
  private level: LogLevel;
  private isDevelopment: boolean;

  private constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.level = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  /**
   * Gets the singleton logger instance
   * @returns {Logger} The logger instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Sets the minimum log level for output
   * @param {LogLevel} level - Minimum level to log
   * @example
   * ```typescript
   * logger.setLevel(LogLevel.WARN) // Only warnings and errors
   * ```
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.level;
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = entry.context ? `[${entry.context}] ` : '';
    return `${entry.timestamp} [${LogLevel[entry.level]}] ${prefix}${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      context,
    };

    const formattedMessage = this.formatMessage(entry);

    // In development, use console methods
    if (this.isDevelopment) {
      switch (level) {
        case LogLevel.DEBUG:
          // eslint-disable-next-line no-console
          console.debug(formattedMessage, data);
          break;
        case LogLevel.INFO:
          // eslint-disable-next-line no-console
          console.info(formattedMessage, data);
          break;
        case LogLevel.WARN:
           
          console.warn(formattedMessage, data);
          break;
        case LogLevel.ERROR:
           
          console.error(formattedMessage, data);
          break;
      }
    }

    // In production, could send to external logging service
    // Example: sendToLoggingService(entry);
  }

  /**
   * Logs a debug message (only in development)
   * @param {string} message - Message to log
   * @param {unknown} [data] - Additional data to log
   * @param {string} [context] - Context identifier
   */
  debug(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.DEBUG, message, data, context);
  }

  /**
   * Logs an info message
   * @param {string} message - Message to log
   * @param {unknown} [data] - Additional data to log
   * @param {string} [context] - Context identifier
   */
  info(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.INFO, message, data, context);
  }

  /**
   * Logs a warning message
   * @param {string} message - Message to log
   * @param {unknown} [data] - Additional data to log
   * @param {string} [context] - Context identifier
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.WARN, message, data, context);
  }

  /**
   * Logs an error message
   * @param {string} message - Message to log
   * @param {unknown} [data] - Additional error data or Error object
   * @param {string} [context] - Context identifier
   */
  error(message: string, data?: unknown, context?: string): void {
    this.log(LogLevel.ERROR, message, data, context);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

/**
 * Creates a context-specific logger that automatically includes context in all logs
 * @param {string} context - Context identifier for this logger
 * @returns {Object} Logger with context-bound methods
 * @example
 * ```typescript
 * const wsLogger = createLogger('WebSocket')
 * wsLogger.info('Connected') // Logs: [WebSocket] Connected
 * ```
 */
export function createLogger(context: string) {
  return {
    debug: (message: string, data?: unknown) => logger.debug(message, data, context),
    info: (message: string, data?: unknown) => logger.info(message, data, context),
    warn: (message: string, data?: unknown) => logger.warn(message, data, context),
    error: (message: string, data?: unknown) => logger.error(message, data, context),
  };
}