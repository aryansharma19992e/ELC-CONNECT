import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { RedisCache, redis } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error

    // Get cache statistics
    const stats = await RedisCache.getStats()
    
    // Get some sample keys to show cache content
    const sampleKeys = await redis.keys('elc:*')
    const sampleData = sampleKeys.slice(0, 10).map(key => ({
      key: key.replace('elc:', ''),
      ttl: redis.ttl(key)
    }))

    return NextResponse.json({
      success: true,
      cache: {
        stats,
        sampleKeys: sampleData,
        totalKeys: sampleKeys.length
      }
    })
  } catch (error) {
    console.error('Cache management GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'clear-all':
        await RedisCache.clear()
        return NextResponse.json({ 
          success: true, 
          message: 'All cache cleared successfully' 
        })
      
      case 'clear-users':
        await RedisCache.deletePattern('user:*')
        return NextResponse.json({ 
          success: true, 
          message: 'User cache cleared successfully' 
        })
      
      case 'clear-admin':
        await RedisCache.deletePattern('admin:*')
        return NextResponse.json({ 
          success: true, 
          message: 'Admin cache cleared successfully' 
        })
      
      case 'clear-bookings':
        await RedisCache.deletePattern('*booking*')
        return NextResponse.json({ 
          success: true, 
          message: 'Bookings cache cleared successfully' 
        })
      
      case 'clear-rooms':
        await RedisCache.deletePattern('room*')
        return NextResponse.json({ 
          success: true, 
          message: 'Rooms cache cleared successfully' 
        })
      
      default:
        return NextResponse.json({ 
          error: 'Invalid action. Use: clear-all, clear-users, clear-admin, clear-bookings, or clear-rooms' 
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Cache management DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
