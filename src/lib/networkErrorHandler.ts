/**
 * Network error handling with retry mechanism for API calls
 */

export interface RetryOptions {
  maxRetries?: number;
  delay?: number; // Initial delay in ms
  backoffMultiplier?: number; // Multiplier for exponential backoff
  retryableStatusCodes?: number[];
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  headers: Headers;
}

export class NetworkErrorHandler {
  /**
   * Makes a fetch request with retry logic
   */
  static async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<Response> {
    const {
      maxRetries = 3,
      delay = 1000,
      backoffMultiplier = 2,
      retryableStatusCodes = [408, 409, 429, 500, 502, 503, 504],
    } = retryOptions;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          // Ensure we don't cache responses in case of retries
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
          },
        });

        // If the response is successful or not retryable, return it
        if (response.ok || !retryableStatusCodes.includes(response.status)) {
          return response;
        }

        // If this is the last attempt, return the response even if it's an error
        if (attempt === maxRetries) {
          return response;
        }

        // Otherwise, wait before retrying
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        await this.sleep(waitTime);
      } catch (error) {
        lastError = error as Error;

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        await this.sleep(waitTime);
      }
    }

    // This shouldn't happen, but just in case
    throw lastError || new Error('Unknown error during fetchWithRetry');
  }

  /**
   * Makes a fetch request with retry logic and returns parsed JSON
   */
  static async fetchJsonWithRetry<T = any>(
    url: string,
    options: RequestInit = {},
    retryOptions: RetryOptions = {}
  ): Promise<ApiResponse<T>> {
    const response = await this.fetchWithRetry(url, options, retryOptions);

    // Parse the response body as JSON
    let data: T | null = null;
    try {
      data = await response.json();
    } catch (error) {
      // If JSON parsing fails, return the raw text
      console.warn('Failed to parse JSON response:', error);
      data = await response.text() as unknown as T;
    }

    return {
      data,
      status: response.status,
      headers: response.headers,
    };
  }

  /**
   * Sleep for a given number of milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Checks if a status code indicates a retryable error
   */
  static isRetryableStatusCode(status: number, retryableStatusCodes: number[] = []): boolean {
    const defaultRetryable = [408, 409, 429, 500, 502, 503, 504]; // timeout, conflict, rate limit, server errors
    const allRetryable = [...defaultRetryable, ...retryableStatusCodes];
    
    return allRetryable.includes(status);
  }
}

/**
 * Wrapper function for making API calls with error handling and retry logic
 */
export async function makeApiCall<T = any>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<{ data?: T; error?: string; status?: number }> {
  try {
    const response = await NetworkErrorHandler.fetchWithRetry(url, options, retryOptions);
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: errorText || `HTTP error! Status: ${response.status}`,
        status: response.status,
      };
    }

    const data = await response.json();
    return { data, status: response.status };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: errorMessage };
  }
}