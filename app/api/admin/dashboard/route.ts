import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-guard'
import { cachedAdminApi, cachedGeneralApi } from '@/lib/cached-api'

export async function GET(request: NextRequest) {
    try {
        // Verify admin access
        const authResult = await requireAdmin(request)
        if (authResult.error) return authResult.error

        // Fetch dashboard data using cached API
        const [users, bookings, roomsResult, pendingBookings] = await Promise.all([
            cachedAdminApi.getUsers(),
            cachedAdminApi.getBookings(),
            cachedGeneralApi.getRooms(),
            cachedAdminApi.getBookings({ status: 'pending' })
        ])
        const rooms = roomsResult?.rooms || []

        // Calculate room usage for the week
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const usageData = daysOfWeek.map(day => ({ name: day, bookings: 0, capacity: 80 }))

        if (bookings && Array.isArray(bookings)) {
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
        }

        // Calculate user distribution by role
        const userDistribution: { role: string; count: number }[] = []
        if (users && Array.isArray(users)) {
            const roleCounts: { [key: string]: number } = {}
            users.forEach((user: any) => {
                const role = user.role || 'unknown'
                roleCounts[role] = (roleCounts[role] || 0) + 1
            })

            Object.entries(roleCounts).forEach(([role, count]) => {
                userDistribution.push({ role, count })
            })
        }

        // Get recent bookings
        const recentBookings = (bookings && Array.isArray(bookings) ? bookings : [])
            .slice(0, 5)
            .map((booking: any) => ({
                id: booking.id || booking._id,
                userName: booking.userName || 'Unknown User',
                roomName: booking.roomName || 'Unknown Room',
                date: booking.date || '',
                time: booking.startTime && booking.endTime ? `${booking.startTime} - ${booking.endTime}` : '',
                status: booking.status || 'pending'
            }))

        const dashboardData = {
            totalUsers: users?.length || 0,
            totalBookings: bookings?.length || 0,
            totalRooms: rooms?.length || 0,
            pendingBookings: pendingBookings?.length || 0,
            roomUsage: usageData,
            userDistribution,
            recentBookings
        }

        return NextResponse.json(dashboardData)
    } catch (error) {
        console.error('Admin dashboard error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
