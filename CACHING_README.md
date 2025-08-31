# ELC Connect - Redis Caching Implementation

This document explains the Redis caching system implemented in ELC Connect to improve performance and reduce database load.

## Overview

The caching system uses **Upstash Redis** to provide server-side caching for:
- User dashboard statistics
- Admin dashboard data
- Room listings
- Booking information
- User profiles
- Search results

## Benefits

- **Faster Response Times**: Cached data returns instantly instead of hitting the database
- **Reduced Database Load**: Fewer database queries mean better performance
- **Better User Experience**: Dashboard loads faster for both users and admins
- **Scalability**: Redis can handle high concurrent access efficiently

## Architecture

### 1. Cache Layers

```
Client Request → Redis Cache → Database (if cache miss)
     ↑              ↓
     ←─── Cached Response ←───
```

### 2. Cache Keys Structure

```
elc:user:{userId}:stats          # User statistics
elc:user:{userId}:bookings       # User bookings
elc:admin:dashboard              # Admin dashboard data
elc:admin:users                 # Users list
elc:admin:bookings              # Bookings list
elc:room                        # Rooms data
elc:resource                     # Resources data
elc:attendance                   # Attendance records
```

### 3. TTL (Time To Live) Configuration

- **User Stats**: 5 minutes
- **Admin Dashboard**: 3 minutes
- **Bookings**: 2 minutes
- **Rooms**: 10 minutes
- **Users**: 5 minutes
- **Resources**: 15 minutes
- **Attendance**: 3 minutes
- **Search**: 1 minute

## Setup Instructions

### 1. Install Dependencies

```bash
npm install upstash
```

### 2. Set Up Upstash Redis

1. Go to [Upstash Console](https://console.upstash.com/)
2. Create a new Redis database
3. Copy the REST URL and Token
4. Add to your `.env` file:

```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token-here
```

### 3. Environment Variables

Copy from `env.example` and configure:

```bash
cp env.example .env.local
# Edit .env.local with your values
```

## Usage

### 1. Automatic Caching

The system automatically caches responses from these endpoints:
- `GET /api/users` - User listings (admin only)
- `GET /api/bookings` - Booking data
- `GET /api/rooms` - Room information
- `GET /api/users/me` - User profile

### 2. Cache Invalidation

Cache is automatically invalidated when:
- New bookings are created
- Bookings are updated/cancelled
- Users are created/updated
- Rooms are created/updated

### 3. Manual Cache Management

Admins can manage cache via the cache management API:

```bash
# Get cache statistics
GET /api/admin/cache

# Clear all cache
DELETE /api/admin/cache?action=clear-all

# Clear specific cache types
DELETE /api/admin/cache?action=clear-users
DELETE /api/admin/cache?action=clear-admin
DELETE /api/admin/cache?action=clear-bookings
DELETE /api/admin/cache?action=clear-rooms
```

## API Response Format

Cached responses include a `cached` field:

```json
{
  "success": true,
  "data": [...],
  "cached": true,  // or false
  "total": 100
}
```

## Performance Monitoring

### 1. Cache Hit Rate

Monitor cache effectiveness by checking the `cached` field in API responses.

### 2. Redis Statistics

Use the cache management API to monitor:
- Total cached keys
- Memory usage
- Cache hit/miss patterns

### 3. Response Times

Compare response times between cached and non-cached requests.

## Best Practices

### 1. Cache Key Design

- Use consistent naming conventions
- Include relevant filters in cache keys
- Avoid overly specific keys that rarely match

### 2. TTL Management

- Set appropriate TTL based on data freshness requirements
- Use shorter TTL for frequently changing data
- Use longer TTL for static data

### 3. Cache Invalidation

- Invalidate cache when data changes
- Use pattern-based invalidation for related data
- Avoid over-invalidation

## Troubleshooting

### 1. Cache Not Working

- Check Redis connection in `.env`
- Verify Redis service is running
- Check console for Redis connection errors

### 2. Stale Data

- Verify TTL settings are appropriate
- Check cache invalidation logic
- Monitor cache hit/miss patterns

### 3. Memory Issues

- Monitor Redis memory usage
- Adjust TTL values if needed
- Consider implementing cache eviction policies

## Development

### 1. Local Development

For local development, you can use:
- Upstash Redis (recommended)
- Local Redis instance
- Redis Cloud

### 2. Testing Cache

Test cache functionality by:
- Making multiple requests to the same endpoint
- Checking response headers and `cached` field
- Monitoring Redis logs

### 3. Cache Warming

Consider implementing cache warming for:
- Frequently accessed data
- Critical user paths
- Admin dashboard data

## Security Considerations

- Redis connection uses environment variables
- Cache management API requires admin authentication
- No sensitive data is cached
- Cache keys are namespaced to prevent conflicts

## Monitoring and Analytics

### 1. Cache Metrics

Track these metrics:
- Cache hit rate
- Average response time
- Memory usage
- Key expiration patterns

### 2. Performance Impact

Measure:
- Database query reduction
- Overall application performance
- User experience improvements

## Future Enhancements

Potential improvements:
- Cache compression for large objects
- Distributed caching for multiple instances
- Cache warming strategies
- Advanced eviction policies
- Cache analytics dashboard

## Support

For issues with the caching system:
1. Check Redis connection
2. Verify environment variables
3. Review cache invalidation logic
4. Monitor Redis logs
5. Check application logs for cache errors
