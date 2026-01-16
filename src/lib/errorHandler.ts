/**
 * Error logging utility with context information
 */

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  timestamp: number;
  stack?: string;
  additionalInfo?: Record<string, any>;
}

export interface LoggableError {
  name: string;
  message: string;
  stack?: string;
  context: ErrorContext;
}

export class ErrorHandler {
  /**
   * Logs an error with context information
   */
  static logError(error: Error, context: Partial<ErrorContext> = {}): LoggableError {
    const errorContext: ErrorContext = {
      timestamp: Date.now(),
      stack: error.stack,
      ...context,
    };

    const loggableError: LoggableError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context: errorContext,
    };

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error logged:', loggableError);
    }

    // In production, you would send this to an error reporting service
    // For now, we'll just log it to the console
    console.error('Application Error:', {
      name: error.name,
      message: error.message,
      url: context.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      timestamp: new Date(errorContext.timestamp).toISOString(),
      stack: error.stack,
      additionalInfo: context.additionalInfo,
    });

    return loggableError;
  }

  /**
   * Reports an error to an external analytics/debugging service
   */
  static async reportError(error: Error, context: Partial<ErrorContext> = {}) {
    // In a real application, this would send the error to an external service like Sentry, Bugsnag, etc.
    // For now, we'll just log it to the console

    const errorReport = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      url: context.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      timestamp: new Date().toISOString(),
      additionalInfo: context.additionalInfo,
    };

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Error reported:', errorReport);
    }

    // In production, you would send this to an error reporting service
    // Example:
    // try {
    //   await fetch('https://your-error-reporting-service.com/api/errors', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${process.env.ERROR_REPORTING_API_KEY}`,
    //     },
    //     body: JSON.stringify(errorReport),
    //   });
    // } catch (reportingError) {
    //   console.error('Failed to report error:', reportingError);
    // }
  }

  /**
   * Creates a user-friendly error message that doesn't expose sensitive information
   */
  static createUserFriendlyMessage(error: Error): string {
    // Sanitize error messages to avoid exposing sensitive information
    const errorMessage = error.message.toLowerCase();

    // Check for sensitive information in error messages
    if (
      errorMessage.includes('password') ||
      errorMessage.includes('token') ||
      errorMessage.includes('secret') ||
      errorMessage.includes('database') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('sql') ||
      errorMessage.includes('internal')
    ) {
      return 'An internal error occurred. Please try again later.';
    }

    // Return generic message for network errors
    if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('timeout')
    ) {
      return 'Network error. Please check your connection and try again.';
    }

    // Return generic message for validation errors
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('zod')
    ) {
      return 'Invalid input provided. Please check your entries and try again.';
    }

    // For other errors, return a generic message
    return 'An error occurred. Please try again.';
  }

  /**
   * Handles an error and returns a sanitized response
   */
  static handleError(error: Error, context: Partial<ErrorContext> = {}) {
    // Log the error with context
    this.logError(error, context);

    // Report the error for analytics/debugging
    this.reportError(error, context);

    // Create a user-friendly message
    const userMessage = this.createUserFriendlyMessage(error);

    return {
      error: userMessage,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        originalError: error.message,
        stack: error.stack
      })
    };
  }
}

// Convenience function for API routes
export function createErrorResponse(error: Error, context: Partial<ErrorContext> = {}, statusCode: number = 500) {
  const handledError = ErrorHandler.handleError(error, context);

  return new Response(JSON.stringify(handledError), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}