// Redis cache configuration using Upstash Redis
// Provides server-side caching for improved performance

import { Redis } from '@upstash/redis'

// Initialize Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache configuration
export const CACHE_CONFIG = {
  // Default TTL values (in seconds)
  TTL: {
    USER_STATS: 300,        // 5 minutes
    ADMIN_DASHBOARD: 180,   // 3 minutes
    BOOKINGS: 120,          // 2 minutes
    ROOMS: 600,             // 10 minutes
    USERS: 300,             // 5 minutes
    RESOURCES: 900,         // 15 minutes
    ATTENDANCE: 180,        // 3 minutes
    SEARCH: 60,             // 1 minute
  },

  // Cache key prefixes
  PREFIXES: {
    USER: 'user',
    ADMIN: 'admin',
    BOOKING: 'booking',
    ROOM: 'room',
    USER_LIST: 'users',
    RESOURCE: 'resource',
    ATTENDANCE: 'attendance',
    SEARCH: 'search',
    STATS: 'stats',
  }
} as const

// Cache utility functions
export class RedisCache {
  /**
   * Set a cache item with TTL
   */
  static async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      const ttlSeconds = ttl || CACHE_CONFIG.TTL.USER_STATS

      await redis.setex(fullKey, ttlSeconds, JSON.stringify(data))
    } catch (error) {
      console.warn('Redis cache set failed:', error)
    }
  }

  /**
   * Get a cache item
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key)
      const data = await redis.get(fullKey)

      if (data && typeof data === 'string') {
        return JSON.parse(data)
      }
      return null
    } catch (error) {
      console.warn('Redis cache get failed:', error)
      return null
    }
  }

  /**
   * Check if a key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const fullKey = this.buildKey(key)
      const result = await redis.exists(fullKey)
      return result === 1
    } catch (error) {
      console.warn('Redis cache exists check failed:', error)
      return false
    }
  }

  /**
   * Delete a cache item
   */
  static async delete(key: string): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      await redis.del(fullKey)
    } catch (error) {
      console.warn('Redis cache delete failed:', error)
    }
  }

  /**
   * Delete multiple cache items by pattern
   */
  static async deletePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = this.buildKey(pattern)
      const keys = await redis.keys(fullPattern)

      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.warn('Redis cache pattern delete failed:', error)
    }
  }

  /**
   * Set cache item with hash (for complex data structures)
   */
  static async hset<T>(key: string, field: string, data: T, ttl?: number): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      const ttlSeconds = ttl || CACHE_CONFIG.TTL.USER_STATS

      await redis.hset(fullKey, field, JSON.stringify(data))
      await redis.expire(fullKey, ttlSeconds)
    } catch (error) {
      console.warn('Redis cache hset failed:', error)
    }
  }

  /**
   * Get cache item from hash
   */
  static async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const fullKey = this.buildKey(key)
      const data = await redis.hget(fullKey, field)

      if (data && typeof data === 'string') {
        return JSON.parse(data)
      }
      return null
    } catch (error) {
      console.warn('Redis cache hget failed:', error)
      return null
    }
  }

  /**
   * Get all fields from a hash
   */
  static async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const fullKey = this.buildKey(key)
      const data = await redis.hgetall(fullKey)

      if (data && Object.keys(data).length > 0) {
        const result: Record<string, T> = {}
        for (const [field, value] of Object.entries(data)) {
          if (value && typeof value === 'string') {
            result[field] = JSON.parse(value)
          }
        }
        return result
      }
      return null
    } catch (error) {
      console.warn('Redis cache hgetall failed:', error)
      return null
    }
  }

  /**
   * Increment a counter
   */
  static async incr(key: string, ttl?: number): Promise<number> {
    try {
      const fullKey = this.buildKey(key)
      const ttlSeconds = ttl || CACHE_CONFIG.TTL.USER_STATS

      const result = await redis.incr(fullKey)
      await redis.expire(fullKey, ttlSeconds)
      return result
    } catch (error) {
      console.warn('Redis cache incr failed:', error)
      return 0
    }
  }

  /**
   * Set cache item with expiration
   */
  static async setex<T>(key: string, ttl: number, data: T): Promise<void> {
    try {
      const fullKey = this.buildKey(key)
      await redis.setex(fullKey, ttl, JSON.stringify(data))
    } catch (error) {
      console.warn('Redis cache setex failed:', error)
    }
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<{ info: any; keys: number }> {
    try {
      const info = await redis.info()
      const keys = await redis.dbsize()
      return { info, keys }
    } catch (error) {
      console.warn('Redis cache stats failed:', error)
      return { info: null, keys: 0 }
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      await redis.flushdb()
    } catch (error) {
      console.warn('Redis cache clear failed:', error)
    }
  }

  /**
   * Build cache key with prefix
   */
  private static buildKey(key: string): string {
    return `elc:${key}`
  }
}

// Cache key builders for different data types
export const buildCacheKey = {
  userStats: (userId: string) => `${CACHE_CONFIG.PREFIXES.USER}:${userId}:stats`,
  userBookings: (userId: string, filters?: Record<string, any>) => {
    const base = `${CACHE_CONFIG.PREFIXES.USER}:${userId}:bookings`
    if (!filters) return base
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${base}:${filterStr}`
  },
  adminDashboard: () => `${CACHE_CONFIG.PREFIXES.ADMIN}:dashboard`,
  adminUsers: (filters?: Record<string, any>) => {
    const base = `${CACHE_CONFIG.PREFIXES.ADMIN}:${CACHE_CONFIG.PREFIXES.USER_LIST}`
    if (!filters) return base
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${base}:${filterStr}`
  },
  adminBookings: (filters?: Record<string, any>) => {
    const base = `${CACHE_CONFIG.PREFIXES.ADMIN}:${CACHE_CONFIG.PREFIXES.BOOKING}`
    if (!filters) return base
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${filterStr}`
  },
  rooms: (filters?: Record<string, any>) => {
    const base = CACHE_CONFIG.PREFIXES.ROOM
    if (!filters) return base
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${base}:${filterStr}`
  },
  resources: (filters?: Record<string, any>) => {
    const base = CACHE_CONFIG.PREFIXES.RESOURCE
    if (!filters) return base
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${base}:${filterStr}`
  },
  attendance: (filters?: Record<string, any>) => {
    const base = CACHE_CONFIG.PREFIXES.ATTENDANCE
    if (!filters) return base
    const filterStr = Object.entries(filters)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
    return `${base}:${filterStr}`
  },
  search: (query: string, type: string) => `${CACHE_CONFIG.PREFIXES.SEARCH}:${type}:${query}`,
  stats: (type: string, period: string) => `${CACHE_CONFIG.PREFIXES.STATS}:${type}:${period}`,
}

// Cache invalidation helpers
export const invalidateCache = {
  user: (userId: string) => {
    RedisCache.deletePattern(`user:${userId}:*`)
  },
  admin: () => {
    RedisCache.deletePattern('admin:*')
  },
  bookings: () => {
    RedisCache.deletePattern('*booking*')
    RedisCache.deletePattern('*stats*')
  },
  rooms: () => {
    RedisCache.deletePattern('room*')
  },
  users: () => {
    RedisCache.deletePattern('*user*')
    RedisCache.deletePattern('admin:*')
  },
  all: () => {
    RedisCache.clear()
  }
}

// Redis instance is already exported above
