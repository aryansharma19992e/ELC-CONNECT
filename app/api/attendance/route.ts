import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Attendance from '@/lib/models/Attendance'
import User from '@/lib/models/User'
import Room from '@/lib/models/Room'
import { authenticateUser, requireRole } from '@/lib/middleware'

const createAttendanceSchema = z.object({
  roomId: z.string().min(1),
  qrCode: z.string().min(1),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  notes: z.string().optional()
})

const updateAttendanceSchema = z.object({
  checkOutTime: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'early_departure']).optional(),
  notes: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Build filter object
    const filter: any = {}
    
    if (userId) {
      filter.userId = userId
    }
    
    if (roomId) {
      filter.roomId = roomId
    }
    
    if (date) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setDate(endOfDay.getDate() + 1)
      filter.date = { $gte: startOfDay, $lt: endOfDay }
    }
    
    if (status) {
      filter.status = status
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const total = await Attendance.countDocuments(filter)
    
    // Get attendance records with pagination and populate related data
    const attendance = await Attendance.find(filter)
      .populate('userId', 'name email role studentId')
      .populate('roomId', 'name roomId type')
      .sort({ date: -1, checkInTime: -1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      success: true,
      attendance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = createAttendanceSchema.parse(body)
    
    // Verify room exists
    const room = await Room.findById(validatedData.roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    // Check if attendance record already exists for this user, room, and date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const existingRecord = await Attendance.findOne({
      userId: user.userId,
      roomId: validatedData.roomId,
      date: { $gte: today, $lt: tomorrow }
    })
    
    if (existingRecord) {
      return NextResponse.json(
        { error: 'Attendance record already exists for today' },
        { status: 409 }
      )
    }
    
    // Determine status based on check-in time
    const now = new Date()
    const currentTime = now.toTimeString().slice(0, 5)
    const checkInTime = validatedData.checkInTime || currentTime
    
    // Consider late if checking in after 9:00 AM
    const isLate = checkInTime > '09:00'
    const status = isLate ? 'late' : 'present'
    
    // Create new attendance record
    const newRecord = new Attendance({
      userId: user.userId,
      roomId: validatedData.roomId,
      date: today,
      checkInTime: checkInTime,
      qrCode: validatedData.qrCode,
      status: status,
      notes: validatedData.notes
    })
    
    await newRecord.save()
    
    // Populate related data for response
    await newRecord.populate('userId', 'name email role studentId')
    await newRecord.populate('roomId', 'name roomId type')
    
    return NextResponse.json({
      success: true,
      attendance: newRecord,
      message: 'Attendance recorded successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Attendance POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('id')
    
    if (!recordId) {
      return NextResponse.json(
        { error: 'Attendance record ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateAttendanceSchema.parse(body)
    
    // Find the attendance record
    const record = await Attendance.findById(recordId)
    if (!record) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }
    
    // Check if user can modify this record (owner or admin)
    if (record.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only modify your own attendance records' },
        { status: 403 }
      )
    }
    
    // Update attendance record
    const updatedRecord = await Attendance.findByIdAndUpdate(
      recordId,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role studentId').populate('roomId', 'name roomId type')
    
    return NextResponse.json({
      success: true,
      attendance: updatedRecord,
      message: 'Attendance record updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Attendance PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user (admin only for deletion)
    const authResult = await requireRole(['admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const recordId = searchParams.get('id')
    
    if (!recordId) {
      return NextResponse.json(
        { error: 'Attendance record ID is required' },
        { status: 400 }
      )
    }
    
    // Find and delete the attendance record
    const deletedRecord = await Attendance.findByIdAndDelete(recordId)
    
    if (!deletedRecord) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    })
    
  } catch (error) {
    console.error('Attendance DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

