import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'
import Room from '@/lib/models/Room'
import User from '@/lib/models/User'
import { authenticateUser, requireRole } from '@/lib/middleware'

const createBookingSchema = z.object({
  roomId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  purpose: z.string().min(1),
  attendees: z.number().min(1),
  equipment: z.array(z.string()).optional(),
  notes: z.string().optional()
})

const updateBookingSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  purpose: z.string().optional(),
  attendees: z.number().min(1).optional(),
  equipment: z.array(z.string()).optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'rejected']).optional()
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
    const total = await Booking.countDocuments(filter)
    
    // Get bookings with pagination and populate related data
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email role')
      .populate('roomId', 'name roomId type capacity')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      success: true,
      bookings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    console.error('Bookings GET error:', error)
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
    const validatedData = createBookingSchema.parse(body)
    
    // Verify room exists and is available
    const room = await Room.findById(validatedData.roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    if (!room.available) {
      return NextResponse.json(
        { error: 'Room is not available for booking' },
        { status: 400 }
      )
    }
    
    // Check for booking conflicts
    const startDateTime = new Date(`${validatedData.date}T${validatedData.startTime}`)
    const endDateTime = new Date(`${validatedData.date}T${validatedData.endTime}`)
    
    const conflictingBookings = await Booking.find({
      roomId: validatedData.roomId,
      date: { $gte: startDateTime, $lt: endDateTime },
      status: { $nin: ['cancelled', 'rejected'] }
    })
    
    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Room is not available for the selected time slot' },
        { status: 409 }
      )
    }
    
    // Create new booking
    const newBooking = new Booking({
      userId: user.userId,
      roomId: validatedData.roomId,
      date: startDateTime,
      startTime: validatedData.startTime,
      endTime: validatedData.endTime,
      purpose: validatedData.purpose,
      attendees: validatedData.attendees,
      equipment: validatedData.equipment || [],
      notes: validatedData.notes,
      status: 'pending'
    })
    
    await newBooking.save()
    
    // Populate related data for response
    await newBooking.populate('userId', 'name email role')
    await newBooking.populate('roomId', 'name roomId type capacity')
    
    return NextResponse.json({
      success: true,
      booking: newBooking,
      message: 'Booking created successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Bookings POST error:', error)
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
    const bookingId = searchParams.get('id')
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateBookingSchema.parse(body)
    
    // Find the booking
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Check if user can modify this booking (owner or admin)
    if (booking.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only modify your own bookings' },
        { status: 403 }
      )
    }
    
    // If updating time, check for conflicts
    if (validatedData.startTime || validatedData.endTime) {
      const startTime = validatedData.startTime || booking.startTime
      const endTime = validatedData.endTime || booking.endTime
      
      const conflictingBookings = await Booking.find({
        _id: { $ne: bookingId },
        roomId: booking.roomId,
        date: { $gte: booking.date, $lt: new Date(booking.date.getTime() + 24 * 60 * 60 * 1000) },
        status: { $nin: ['cancelled', 'rejected'] },
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } }
        ]
      })
      
      if (conflictingBookings.length > 0) {
        return NextResponse.json(
          { error: 'Room is not available for the updated time slot' },
          { status: 409 }
        )
      }
    }
    
    // Update booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('userId', 'name email role').populate('roomId', 'name roomId type capacity')
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Bookings PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }
    
    // Find the booking
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Check if user can cancel this booking (owner or admin)
    if (booking.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only cancel your own bookings' },
        { status: 403 }
      )
    }
    
    // Soft delete - mark as cancelled
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled', updatedAt: new Date() },
      { new: true }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully'
    })
    
  } catch (error) {
    console.error('Bookings DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

