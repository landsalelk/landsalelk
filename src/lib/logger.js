// src/lib/logger.js

/**
 * A simple logger utility that only logs messages in the development environment.
 * This prevents noisy console output in production while preserving debugging
 * capabilities during development.
 */
const logger = {
  /**
   * Logs a standard message.
   * @param {...any} args
   */
  log: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },

  /**
   * Logs a warning message.
   * @param {...any} args
   */
  warn: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args);
    }
  },

  /**
   * Logs an error message.
   * @param {...any} args
   */
  error: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args);
    }
  },
};

export default logger;
