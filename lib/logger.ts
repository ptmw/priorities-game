/**
 * Logging Utility
 *
 * Provides environment-aware logging that:
 * - Only logs to console in development
 * - Can be extended to send to error tracking services in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log informational messages (development only)
 */
function log(...args: any[]): void {
  if (isDevelopment) {
    console.log(...args);
  }
}

/**
 * Log warning messages (development only)
 */
function warn(...args: any[]): void {
  if (isDevelopment) {
    console.warn(...args);
  }
}

/**
 * Log error messages
 * In production, this should be extended to send to error tracking services
 * like Sentry, LogRocket, or Datadog
 */
function error(...args: any[]): void {
  if (isDevelopment) {
    console.error(...args);
  } else {
    // In production, send to error tracking service
    // Example: Sentry.captureException(args[0]);
    console.error(...args);
  }
}

/**
 * Log debug messages (development only)
 */
function debug(...args: any[]): void {
  if (isDevelopment) {
    console.debug(...args);
  }
}

export const logger = {
  log,
  warn,
  error,
  debug,
};
