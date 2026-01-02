import AsyncStorage from "@react-native-async-storage/async-storage";

interface QueuedOperation {
  id: string;
  userId: number;
  operationType: "create" | "update" | "delete";
  resourceType: "order" | "user" | "transaction";
  resourceData: any;
  timestamp: number;
  retryCount: number;
}

const QUEUE_KEY = "@offline_queue";
const MAX_RETRIES = 3;

class OfflineQueueManager {
  private queue: QueuedOperation[] = [];
  private processing: boolean = false;

  /**
   * Initialize queue from storage
   */
  async init(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load offline queue:", error);
    }
  }

  /**
   * Add operation to queue
   */
  async enqueue(
    operation: Omit<QueuedOperation, "id" | "timestamp" | "retryCount">,
  ): Promise<void> {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.queue.push(queuedOp);
    await this.saveQueue();
  }

  /**
   * Process queue when online
   */
  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const operation = this.queue[0];

      try {
        await this.executeOperation(operation);
        // Success - remove from queue
        this.queue.shift();
      } catch (error) {
        // Failed - increment retry count
        operation.retryCount++;

        if (operation.retryCount >= MAX_RETRIES) {
          // Max retries reached - remove from queue
          console.error("Operation failed after max retries:", operation);
          this.queue.shift();
        } else {
          // Keep in queue for retry
          break;
        }
      }

      await this.saveQueue();
    }

    this.processing = false;
  }

  /**
   * Execute a queued operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    // This will be implemented with actual API calls
    // For now, just simulate
    await new Promise((resolve) => setTimeout(resolve, 100));
    console.log("Executing operation:", operation);
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error("Failed to save offline queue:", error);
    }
  }

  /**
   * Clear queue
   */
  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
  }

  /**
   * Get queue status
   */
  getStatus(): { count: number; processing: boolean } {
    return {
      count: this.queue.length,
      processing: this.processing,
    };
  }
}

export const offlineQueue = new OfflineQueueManager();
