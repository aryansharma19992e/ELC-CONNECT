// Cached API wrapper for ELC Connect
// Integrates Redis caching with existing API functions

import { RedisCache, buildCacheKey, CACHE_CONFIG, invalidateCache } from './redis'
import { connectToDatabase } from './db'
import { User } from './models/User'
import { Booking } from './models/Booking'
import { Room } from './models/Room'
import { Resource } from './models/Resource'
import { Attendance } from './models/Attendance'

// Cached API functions for users
const cachedUserApi = {
  /**
   * Get user profile with caching
   */
  async getProfile(userId: string) {
    const cacheKey = buildCacheKey.userStats(userId)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    const user = await User.findById(userId).lean()

    if (user) {
      // Cache the result
      await RedisCache.set(cacheKey, user, CACHE_CONFIG.TTL.USER_STATS)
      return user
    }

    return null
  },

  /**
   * Get user bookings with caching
   */
  async getBookings(userId: string, filters?: Record<string, any>) {
    const cacheKey = buildCacheKey.userBookings(userId, filters)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    let query = { userId }

    if (filters) {
      if (filters.status) query = { ...query, status: filters.status }
      if (filters.date) query = { ...query, date: filters.date }
      if (filters.roomId) query = { ...query, roomId: filters.roomId }
    }

    const bookings = await Booking.find(query)
      .populate('roomId', 'name capacity equipment')
      .sort({ createdAt: -1 })
      .lean()

    const result = {
      bookings,
      total: bookings.length
    }

    // Cache the result
    await RedisCache.set(cacheKey, result, CACHE_CONFIG.TTL.BOOKINGS)
    return result
  },

  /**
   * Get user statistics with caching
   */
  async getUserStats(userId: string) {
    const cacheKey = buildCacheKey.userStats(userId)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database and calculate stats
    const db = await connectToDatabase()
    const allBookings = await Booking.find({ userId }).lean()

    const totalBookings = allBookings.length

    // Calculate hours this month
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    const monthlyBookings = allBookings.filter((booking: any) => {
      if (!booking.date) return false
      const bookingDate = new Date(booking.date)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    })

    let hoursThisMonth = 0
    monthlyBookings.forEach((booking: any) => {
      if (booking.startTime && booking.endTime) {
        const parseTime = (timeStr: string): number => {
          const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
          if (!match) return 0
          let [_, hours, minutes, ampm] = match
          let h = parseInt(hours)
          const m = parseInt(minutes)
          if (ampm.toLowerCase() === 'pm' && h < 12) h += 12
          if (ampm.toLowerCase() === 'am' && h === 12) h = 0
          return h * 60 + m
        }

        const startMinutes = parseTime(booking.startTime)
        const endMinutes = parseTime(booking.endTime)
        const duration = (endMinutes - startMinutes) / 60
        hoursThisMonth += duration
      }
    })

    // Calculate favorite room
    const roomCounts: { [key: string]: number } = {}
    allBookings.forEach((booking: any) => {
      const roomName = booking.roomName || booking.roomId || "Unknown"
      roomCounts[roomName] = (roomCounts[roomName] || 0) + 1
    })
    const favoriteRoom = Object.keys(roomCounts).length > 0
      ? Object.keys(roomCounts).reduce((a, b) => roomCounts[a] > roomCounts[b] ? a : b)
      : "-"

    // Calculate today's bookings
    const today = new Date().toISOString().split('T')[0]
    const todaysBookings = allBookings.filter((booking: any) => booking.date === today)
    const upcomingToday = todaysBookings.length

    const stats = {
      totalBookings,
      hoursThisMonth: Math.round(hoursThisMonth * 10) / 10,
      favoriteRoom,
      upcomingToday,
    }

    // Cache the result
    await RedisCache.set(cacheKey, stats, CACHE_CONFIG.TTL.USER_STATS)
    return stats
  }
}

// Cached API functions for admin
const cachedAdminApi = {
  /**
   * Get admin dashboard data with caching
   */
  async getDashboardData() {
    const cacheKey = buildCacheKey.adminDashboard()

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()

    const [users, bookings, rooms, pendingBookings] = await Promise.all([
      User.find().lean(),
      Booking.find().lean(),
      Room.find().lean(),
      Booking.find({ status: 'pending' }).lean()
    ])

    // Calculate admin stats
    const totalUsers = users.length
    const activeBookings = bookings.filter((b: any) => b.status === 'confirmed').length
    const totalRooms = rooms.length
    const pendingApprovals = pendingBookings.length

    // Calculate room usage data
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const usageData = daysOfWeek.map(day => ({ name: day, bookings: 0, capacity: 80 }))

    bookings.forEach((booking: any) => {
      if (booking.date) {
        const bookingDate = new Date(booking.date)
        const dayOfWeek = bookingDate.getDay()
        const dayName = daysOfWeek[dayOfWeek]

        const dayData = usageData.find(day => day.name === dayName)
        if (dayData) {
          dayData.bookings += 1
        }
      }
    })

    // Calculate user distribution by role
    const roleCounts = {
      faculty: users.filter((u: any) => u.role === 'faculty').length,
      admin: users.filter((u: any) => u.role === 'admin').length
    }

    const userTypeData = [
      { name: "Faculty", value: roleCounts.faculty, color: "#10B981" },
      { name: "Admins", value: roleCounts.admin, color: "#F59E0B" },
    ]

    // Recent activity
    const recentBookings = bookings.slice(0, 5).map((booking: any) => ({
      id: booking.id,
      user: booking.userName || "Unknown User",
      action: `Booked ${booking.roomName || "Room"}`,
      time: new Date(booking.createdAt).toLocaleDateString(),
      type: "booking",
      status: booking.status,
    }))

    const dashboardData = {
      systemStats: {
        totalUsers,
        activeBookings,
        totalRooms,
        systemUptime: "99.8%",
        todayBookings: bookings.length,
        pendingApprovals,
        securityAlerts: 0,
        maintenanceIssues: 0,
      },
      pendingBookings,
      roomUsageData: usageData,
      userTypeData,
      recentActivity: recentBookings,
      alerts: []
    }

    // Cache the result
    await RedisCache.set(cacheKey, dashboardData, CACHE_CONFIG.TTL.ADMIN_DASHBOARD)
    return dashboardData
  },

  /**
   * Get users list with caching
   */
  async getUsers(filters?: Record<string, any>) {
    const cacheKey = buildCacheKey.adminUsers(filters)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    let query = {}

    if (filters) {
      if (filters.role) query = { ...query, role: filters.role }
      if (filters.department) query = { ...query, department: filters.department }
      if (filters.status) query = { ...query, status: filters.status }
      if (filters.search) {
        query = {
          ...query,
          $or: [
            { name: { $regex: filters.search, $options: 'i' } },
            { email: { $regex: filters.search, $options: 'i' } }
          ]
        }
      }
    }

    const users = await User.find(query).lean()
    const result = { users, total: users.length }

    // Cache the result
    await RedisCache.set(cacheKey, result, CACHE_CONFIG.TTL.USERS)
    return result
  },

  /**
   * Get bookings list with caching
   */
  async getBookings(filters?: Record<string, any>) {
    const cacheKey = buildCacheKey.adminBookings(filters)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    let query = {}

    if (filters) {
      if (filters.userId) query = { ...query, userId: filters.userId }
      if (filters.roomId) query = { ...query, roomId: filters.roomId }
      if (filters.date) query = { ...query, date: filters.date }
      if (filters.status) query = { ...query, status: filters.status }
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email role')
      .populate('roomId', 'name capacity')
      .sort({ createdAt: -1 })
      .lean()

    const result = { bookings, total: bookings.length }

    // Cache the result
    await RedisCache.set(cacheKey, result, CACHE_CONFIG.TTL.BOOKINGS)
    return result
  }
}

// Cached API functions for general data
const cachedGeneralApi = {
  /**
   * Get rooms with caching
   */
  async getRooms(filters?: Record<string, any>) {
    const cacheKey = buildCacheKey.rooms(filters)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    let query = {}

    if (filters) {
      if (filters.available !== undefined) query = { ...query, available: filters.available }
      if (filters.type) query = { ...query, type: filters.type }
      if (filters.capacity) query = { ...query, capacity: { $gte: filters.capacity } }
      if (filters.equipment) query = { ...query, equipment: { $in: [filters.equipment] } }
      if (filters.floor) query = { ...query, floor: filters.floor }
    }

    const rooms = await Room.find(query).lean()
    const result = { rooms, total: rooms.length }

    // Cache the result
    await RedisCache.set(cacheKey, result, CACHE_CONFIG.TTL.ROOMS)
    return result
  },

  /**
   * Get resources with caching
   */
  async getResources(filters?: Record<string, any>) {
    const cacheKey = buildCacheKey.resources(filters)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    let query = {}

    if (filters) {
      if (filters.type) query = { ...query, type: filters.type }
      if (filters.category) query = { ...query, category: filters.category }
      if (filters.author) query = { ...query, author: filters.author }
      if (filters.search) {
        query = {
          ...query,
          $or: [
            { title: { $regex: filters.search, $options: 'i' } },
            { description: { $regex: filters.search, $options: 'i' } },
            { tags: { $in: [new RegExp(filters.search, 'i')] } }
          ]
        }
      }
    }

    const resources = await Resource.find(query).lean()
    const result = { resources, total: resources.length }

    // Cache the result
    await RedisCache.set(cacheKey, result, CACHE_CONFIG.TTL.RESOURCES)
    return result
  },

  /**
   * Get attendance records with caching
   */
  async getAttendance(filters?: Record<string, any>) {
    const cacheKey = buildCacheKey.attendance(filters)

    // Try to get from cache first
    const cached = await RedisCache.get(cacheKey)
    if (cached) {
      return cached
    }

    // Fetch from database
    const db = await connectToDatabase()
    let query = {}

    if (filters) {
      if (filters.userId) query = { ...query, userId: filters.userId }
      if (filters.roomId) query = { ...query, roomId: filters.roomId }
      if (filters.date) query = { ...query, date: filters.date }
      if (filters.status) query = { ...query, status: filters.status }
    }

    const attendance = await Attendance.find(query)
      .populate('userId', 'name email')
      .populate('roomId', 'name')
      .sort({ createdAt: -1 })
      .lean()

    const result = { attendance, total: attendance.length }

    // Cache the result
    await RedisCache.set(cacheKey, result, CACHE_CONFIG.TTL.ATTENDANCE)
    return result
  }
}

// Cache invalidation functions
const cacheInvalidation = {
  /**
   * Invalidate user-related cache
   */
  invalidateUser: (userId: string) => {
    invalidateCache.user(userId)
  },

  /**
   * Invalidate admin-related cache
   */
  invalidateAdmin: () => {
    invalidateCache.admin()
  },

  /**
   * Invalidate booking-related cache
   */
  invalidateBookings: () => {
    invalidateCache.bookings()
  },

  /**
   * Invalidate room-related cache
   */
  invalidateRooms: () => {
    invalidateCache.rooms()
  },

  /**
   * Invalidate all cache
   */
  invalidateAll: () => {
    invalidateCache.all()
  }
}

// Export all cached API functions
export {
  cachedUserApi,
  cachedAdminApi,
  cachedGeneralApi,
  cacheInvalidation
}
