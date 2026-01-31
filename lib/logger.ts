/**
 * Professional Logger Service for Frontend
 *
 * Features:
 * - Multiple log levels (debug, info, warn, error, critical)
 * - Environment-aware (auto disable in production)
 * - Consistent formatting
 * - Optional error tracking integration
 * - Performance monitoring
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "critical";

interface LoggerConfig {
  enableDebug: boolean;
  enableInfo: boolean;
  enablePerformance: boolean;
  prefix?: string;
}

class Logger {
  private config: LoggerConfig;
  private isDevelopment: boolean;

  constructor(config?: Partial<LoggerConfig>) {
    this.isDevelopment = process.env.NODE_ENV === "development";

    this.config = {
      enableDebug: this.isDevelopment,
      enableInfo: this.isDevelopment,
      enablePerformance: this.isDevelopment,
      prefix: "",
      ...config,
    };
  }

  /**
   * Debug logs - Only in development
   * Use for: Development debugging, verbose information
   */
  debug(message: string, ...args: unknown[]): void {
    if (this.config.enableDebug) {
      console.log(`🔍 [DEBUG]${this.config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Info logs - Only in development
   * Use for: General information, successful operations
   */
  info(message: string, ...args: unknown[]): void {
    if (this.config.enableInfo) {
      console.log(`ℹ️ [INFO]${this.config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Warning logs - Always enabled
   * Use for: Non-critical issues, fallback behaviors
   */
  warn(message: string, ...args: unknown[]): void {
    console.warn(`⚠️ [WARN]${this.config.prefix} ${message}`, ...args);
  }

  /**
   * Error logs - Always enabled
   * Use for: Errors that need attention but app can continue
   */
  error(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ): void {
    const errorInfo = {
      message,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: this.isDevelopment ? error.stack : undefined,
            }
          : error,
      context,
      timestamp: new Date().toISOString(),
    };

    console.error(`❌ [ERROR]${this.config.prefix} ${message}`, errorInfo);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // this.sendToErrorTracking(errorInfo);
  }

  /**
   * Critical logs - Always enabled
   * Use for: Critical errors that break functionality
   */
  critical(
    message: string,
    error?: unknown,
    context?: Record<string, unknown>
  ): void {
    const errorInfo = {
      message,
      error:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : error,
      context,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
    };

    console.error(`🚨 [CRITICAL]${this.config.prefix} ${message}`, errorInfo);

    // TODO: Send to error tracking service immediately
    // this.sendToErrorTracking(errorInfo, { priority: 'high' });
  }

  /**
   * API logs - Only in development
   * Use for: API request/response logging
   */
  api(message: string, data?: Record<string, unknown>): void {
    if (this.config.enableInfo) {
      console.log(`📡 [API]${this.config.prefix} ${message}`, data);
    }
  }

  /**
   * Performance logs - Only in development
   * Use for: Performance measurements
   */
  performance(label: string, duration: number): void {
    if (this.config.enablePerformance) {
      const color = duration < 100 ? "🟢" : duration < 500 ? "🟡" : "🔴";
      console.log(
        `${color} [PERF]${this.config.prefix} ${label}: ${duration.toFixed(
          2
        )}ms`
      );
    }
  }

  /**
   * Success logs - Only in development
   * Use for: Successful operations
   */
  success(message: string, ...args: unknown[]): void {
    if (this.config.enableInfo) {
      console.log(`✅ [SUCCESS]${this.config.prefix} ${message}`, ...args);
    }
  }

  /**
   * Create a child logger with prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      ...this.config,
      prefix: `${this.config.prefix} [${prefix}]`,
    });
  }

  /**
   * Measure execution time of async function
   */
  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.performance(label, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }

  // TODO: Implement error tracking integration
  // private sendToErrorTracking(error: unknown, options?: { priority?: string }): void {
  //   if (typeof window !== 'undefined' && window.Sentry) {
  //     window.Sentry.captureException(error, options);
  //   }
  // }
}

// Export singleton instance
export const logger = new Logger();

// Export specialized loggers
export const apiLogger = new Logger({ prefix: " API" });
export const authLogger = new Logger({ prefix: " Auth" });
export const uploadLogger = new Logger({ prefix: " Upload" });

// Export class for custom instances
export { Logger };

// Export types
export type { LogLevel, LoggerConfig };
