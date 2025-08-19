import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting
// In production, use Redis or a database for distributed systems
const rateLimitStore: RateLimitStore = {}

export function createRateLimiter(config: RateLimitConfig) {
  return function rateLimit(request: NextRequest): NextResponse | null {
    const clientId = getClientIdentifier(request)
    const now = Date.now()
    
    // Clean up expired entries
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < now) {
        delete rateLimitStore[key]
      }
    })
    
    // Get or create client record
    if (!rateLimitStore[clientId]) {
      rateLimitStore[clientId] = {
        count: 0,
        resetTime: now + config.windowMs
      }
    }
    
    const clientRecord = rateLimitStore[clientId]
    
    // Check if window has reset
    if (now > clientRecord.resetTime) {
      clientRecord.count = 0
      clientRecord.resetTime = now + config.windowMs
    }
    
    // Increment request count
    clientRecord.count++
    
    // Check if limit exceeded
    if (clientRecord.count > config.maxRequests) {
      const retryAfter = Math.ceil((clientRecord.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: config.message || 'Too many requests',
          retryAfter,
          limit: config.maxRequests,
          window: Math.ceil(config.windowMs / 1000)
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': clientRecord.resetTime.toString()
          }
        }
      )
    }
    
    // Add rate limit headers
    const response = NextResponse.next()
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', (config.maxRequests - clientRecord.count).toString())
    response.headers.set('X-RateLimit-Reset', clientRecord.resetTime.toString())
    
    return null
  }
}

function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  let clientIp = request.ip || 'unknown'
  
  if (forwardedFor) {
    clientIp = forwardedFor.split(',')[0].trim()
  } else if (realIp) {
    clientIp = realIp
  } else if (cfConnectingIp) {
    clientIp = cfConnectingIp
  }
  
  // Add user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${clientIp}:${userAgent}`
}

// Predefined rate limiters for different endpoints
// Make auth rate limit configurable and relaxed in development
const AUTH_WINDOW_MS = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS || (process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000))
const AUTH_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX || (process.env.NODE_ENV === 'production' ? 5 : 100))

export const authRateLimit = createRateLimiter({
  windowMs: AUTH_WINDOW_MS,
  maxRequests: AUTH_MAX,
  message: 'Too many authentication attempts'
})

export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100, // 100 requests per minute
  message: 'Too many API requests'
})

export const strictRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Rate limit exceeded'
})

// Cleanup function to prevent memory leaks
export function cleanupRateLimitStore() {
  const now = Date.now()
  Object.keys(rateLimitStore).forEach(key => {
    if (rateLimitStore[key].resetTime < now) {
      delete rateLimitStore[key]
    }
  })
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
