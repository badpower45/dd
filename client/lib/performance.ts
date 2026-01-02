/**
 * Performance Monitoring and Optimization Utilities
 */

import { QueryClient } from "@tanstack/react-query";
import { Platform } from "react-native";

// Performance configuration
export const PERFORMANCE_CONFIG = {
  // Cache durations (in milliseconds)
  CACHE: {
    SHORT: 1000 * 30, // 30 seconds
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 30, // 30 minutes
  },

  // Refetch intervals
  REFETCH: {
    REALTIME: 1000 * 5, // 5 seconds (for critical data)
    FREQUENT: 1000 * 30, // 30 seconds
    NORMAL: 1000 * 60, // 1 minute
    SLOW: 1000 * 60 * 5, // 5 minutes
  },

  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    INFINITE_SCROLL_LIMIT: 10,
  },

  // Image optimization
  IMAGE: {
    MAX_WIDTH: 1200,
    MAX_HEIGHT: 1200,
    QUALITY: 0.8,
    COMPRESS_FORMAT: Platform.OS === "ios" ? "jpeg" : "webp",
  },

  // Network timeouts
  TIMEOUT: {
    DEFAULT: 10000, // 10 seconds
    UPLOAD: 30000, // 30 seconds
    DOWNLOAD: 60000, // 60 seconds
  },
};

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static start(label: string) {
    this.measurements.set(label, Date.now());
  }

  static end(label: string, logToConsole = __DEV__) {
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`No start time found for ${label}`);
      return;
    }

    const duration = Date.now() - startTime;
    this.measurements.delete(label);

    if (logToConsole) {
      console.log(`[Performance] ${label}: ${duration}ms`);
    }

    // You can send to analytics here
    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  static async measureAsync<T>(
    label: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

// Query client performance utilities
export function getOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: PERFORMANCE_CONFIG.CACHE.MEDIUM,
        staleTime: PERFORMANCE_CONFIG.CACHE.SHORT,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: true,
        refetchOnReconnect: true,
        refetchOnMount: "always",
        // Network mode for better offline support
        networkMode: "online",
      },
      mutations: {
        retry: 1,
        networkMode: "online",
      },
    },
  });
}

// Batch requests utility
export class RequestBatcher {
  private queue: (() => Promise<any>)[] = [];
  private isProcessing = false;
  private batchDelay = 50; // ms

  add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.scheduleBatch();
    });
  }

  private scheduleBatch() {
    if (this.isProcessing) return;

    setTimeout(() => {
      this.processBatch();
    }, this.batchDelay);
  }

  private async processBatch() {
    if (this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = [...this.queue];
    this.queue = [];

    await Promise.allSettled(batch.map((fn) => fn()));

    this.isProcessing = false;

    if (this.queue.length > 0) {
      this.scheduleBatch();
    }
  }
}

// Memoization utility
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: { maxSize?: number; ttl?: number },
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  const maxSize = options?.maxSize || 100;
  const ttl = options?.ttl || PERFORMANCE_CONFIG.CACHE.MEDIUM;

  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: Date.now() });

    // Limit cache size
    if (cache.size > maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return result;
  }) as T;
}

// Debounce utility for search/input
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Throttle utility for scroll/resize events
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Image optimization helper
export async function optimizeImage(uri: string): Promise<string> {
  // You can use expo-image-manipulator here
  // For now, return as is
  return uri;
}

// Log only in development
export const devLog = __DEV__ ? console.log : () => {};
export const devWarn = __DEV__ ? console.warn : () => {};
export const devError = __DEV__ ? console.error : () => {};
