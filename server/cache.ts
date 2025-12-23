/**
 * In-memory cache with TTL support for API response caching
 * Provides performance optimization by reducing database queries
 */

interface CacheEntry<T> {
    data: T;
    expiresAt: number;
    createdAt: number;
}

interface CacheStats {
    hits: number;
    misses: number;
    size: number;
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private stats: CacheStats = { hits: 0, misses: 0, size: 0 };

    // Default TTL values in seconds
    static readonly TTL = {
        SHORT: 30,      // 30 seconds - for frequently changing data
        MEDIUM: 60,     // 1 minute - for moderately stable data
        LONG: 300,      // 5 minutes - for stable data
        EXTENDED: 900,  // 15 minutes - for rarely changing data
    };

    /**
     * Set a value in the cache with TTL
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttlSeconds - Time to live in seconds
     */
    set<T>(key: string, data: T, ttlSeconds: number = MemoryCache.TTL.MEDIUM): void {
        const now = Date.now();
        this.cache.set(key, {
            data,
            expiresAt: now + ttlSeconds * 1000,
            createdAt: now,
        });
        this.stats.size = this.cache.size;
    }

    /**
     * Get a value from the cache
     * Returns null if expired or not found
     */
    get<T>(key: string): T | null {
        const entry = this.cache.get(key) as CacheEntry<T> | undefined;

        if (!entry) {
            this.stats.misses++;
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            // Entry expired, remove it
            this.cache.delete(key);
            this.stats.misses++;
            this.stats.size = this.cache.size;
            return null;
        }

        this.stats.hits++;
        return entry.data;
    }

    /**
     * Get or set pattern - attempts to get from cache, 
     * if not found, calls the factory function and caches the result
     */
    async getOrSet<T>(
        key: string,
        factory: () => Promise<T>,
        ttlSeconds: number = MemoryCache.TTL.MEDIUM
    ): Promise<T> {
        const cached = this.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        const data = await factory();
        this.set(key, data, ttlSeconds);
        return data;
    }

    /**
     * Invalidate cache entries matching a pattern
     * Supports wildcard (*) at the end of the pattern
     */
    invalidate(pattern: string): void {
        if (pattern.endsWith('*')) {
            const prefix = pattern.slice(0, -1);
            for (const key of this.cache.keys()) {
                if (key.startsWith(prefix)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.delete(pattern);
        }
        this.stats.size = this.cache.size;
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.cache.clear();
        this.stats.size = 0;
    }

    /**
     * Get cache statistics
     */
    getStats(): CacheStats & { hitRate: string } {
        const total = this.stats.hits + this.stats.misses;
        const hitRate = total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%';
        return { ...this.stats, hitRate };
    }

    /**
     * Cleanup expired entries (call periodically)
     */
    cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
        this.stats.size = this.cache.size;
    }
}

// Export singleton instance
export const cache = new MemoryCache();

// Export TTL constants for convenience
export const CacheTTL = MemoryCache.TTL;

// Cache key generators for consistency
export const CacheKeys = {
    onlineDrivers: () => 'drivers:online',
    usersByRole: (role: string) => `users:role:${role}`,
    user: (id: number) => `user:${id}`,
    dailyStats: (date: string) => `stats:daily:${date}`,
    restaurantStats: (id: number) => `stats:restaurant:${id}`,
    pendingOrders: () => 'orders:pending',
    driverRatings: (id: number) => `ratings:driver:${id}`,
};

// Auto-cleanup every 5 minutes
setInterval(() => {
    cache.cleanup();
}, 5 * 60 * 1000);
