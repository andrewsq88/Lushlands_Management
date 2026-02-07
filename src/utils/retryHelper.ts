export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt}/${maxAttempts} failed:`, error);

      if (attempt === maxAttempts) {
        break;
      }

      const jitter = Math.random() * 0.3 * delay;
      const actualDelay = Math.min(delay + jitter, maxDelay);

      console.log(`Retrying in ${Math.round(actualDelay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, actualDelay));

      delay *= backoffMultiplier;
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
