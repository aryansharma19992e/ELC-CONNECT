import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Attendance } from '@/lib/models/Attendance'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const query: any = {}
    if (userId) query.userId = userId
    if (bookingId) query.bookingId = bookingId
    if (date) query.date = date
    
    const [items, total] = await Promise.all([
      Attendance.find(query)
        .populate('bookingId', 'roomId startTime endTime purpose')
        .populate('roomId', 'name')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Attendance.countDocuments(query)
    ])
    
    const attendanceRecords = items.map((record: any) => ({
      id: record._id.toString(),
      userId: record.userId._id.toString(),
      userName: record.userId.name,
      userEmail: record.userId.email,
      roomId: record.roomId._id.toString(),
      roomName: record.roomId.name,
      bookingId: record.bookingId._id.toString(),
      bookingStartTime: record.bookingId.startTime,
      bookingEndTime: record.bookingId.endTime,
      bookingPurpose: record.bookingId.purpose,
      date: record.date,
      checkInTime: record.checkInTime,
      checkOutTime: record.checkOutTime,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }))
    
    return NextResponse.json({
      success: true,
      attendance: attendanceRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

