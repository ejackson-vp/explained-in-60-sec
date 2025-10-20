/**
 * Concurrency limiter to control the number of parallel podcast generations
 * across all customers.
 */

type QueuedTask = {
  fn: () => Promise<void>;
  resolve: () => void;
  reject: (error: Error) => void;
};

class ConcurrencyLimiter {
  private maxConcurrent: number;
  private activeCount: number = 0;
  private queue: QueuedTask[] = [];

  constructor(maxConcurrent: number) {
    this.maxConcurrent = maxConcurrent;
  }

  /**
   * Get current stats about the limiter
   */
  getStats() {
    return {
      maxConcurrent: this.maxConcurrent,
      activeCount: this.activeCount,
      queuedCount: this.queue.length,
      availableSlots: this.maxConcurrent - this.activeCount
    };
  }

  /**
   * Execute a task with concurrency limiting.
   * If the limit is reached, the task will be queued.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    // If we're under the limit, execute immediately
    if (this.activeCount < this.maxConcurrent) {
      this.activeCount++;
      console.log(`[Concurrency] Task started immediately. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
      try {
        const result = await fn();
        return result;
      } finally {
        this.activeCount--;
        console.log(`[Concurrency] Task completed. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
        this.processQueue();
      }
    }

    // Otherwise, queue the task
    console.log(`[Concurrency] Task queued. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length + 1}`);
    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        fn: async () => {
          try {
            const result = await fn();
            resolve(result);
          } catch (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          }
        },
        resolve: () => {},
        reject
      });
    });
  }

  /**
   * Process the next item in the queue if slots are available
   */
  private processQueue() {
    if (this.queue.length === 0 || this.activeCount >= this.maxConcurrent) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeCount++;
    console.log(`[Concurrency] Task started from queue. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
    
    task.fn()
      .finally(() => {
        this.activeCount--;
        console.log(`[Concurrency] Queued task completed. Active: ${this.activeCount}/${this.maxConcurrent}, Queue: ${this.queue.length}`);
        this.processQueue();
      });
  }

  /**
   * Update the max concurrent limit (useful for dynamic configuration)
   */
  setMaxConcurrent(newMax: number) {
    if (newMax < 1) {
      throw new Error('Max concurrent must be at least 1');
    }
    this.maxConcurrent = newMax;
    // Try to process queued items if limit was increased
    while (this.activeCount < this.maxConcurrent && this.queue.length > 0) {
      this.processQueue();
    }
  }
}

// Get the max concurrent limit from environment variable, default to 5
const MAX_CONCURRENT_GENERATIONS = parseInt(
  process.env.MAX_CONCURRENT_GENERATIONS || '5',
  10
);

// Use globalThis to persist the limiter across hot reloads in development
// and ensure singleton behavior
declare global {
  var podcastLimiterInstance: ConcurrencyLimiter | undefined;
}

// Initialize or reuse existing instance
if (!globalThis.podcastLimiterInstance) {
  globalThis.podcastLimiterInstance = new ConcurrencyLimiter(MAX_CONCURRENT_GENERATIONS);
  console.log(`Podcast concurrency limiter initialized with max ${MAX_CONCURRENT_GENERATIONS} concurrent generations`);
} else {
  // Update the limit in case the env var changed
  globalThis.podcastLimiterInstance.setMaxConcurrent(MAX_CONCURRENT_GENERATIONS);
}

export const podcastLimiter = globalThis.podcastLimiterInstance;

