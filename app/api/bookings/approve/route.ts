import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Booking from '@/lib/models/Booking'
import { requireRole } from '@/lib/middleware'

const approveBookingSchema = z.object({
  status: z.enum(['confirmed', 'rejected']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    // Require faculty or admin role to approve bookings
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    const approver = (request as any).user
    
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
    const validatedData = approveBookingSchema.parse(body)
    
    // Find the booking
    const booking = await Booking.findById(bookingId)
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Check if booking is in pending status
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Only pending bookings can be approved/rejected' },
        { status: 400 }
      )
    }
    
    // Update booking status
    const updateData: any = {
      status: validatedData.status,
      approvedBy: approver.userId,
      approvedAt: new Date(),
      updatedAt: new Date()
    }
    
    if (validatedData.status === 'rejected' && validatedData.rejectionReason) {
      updateData.rejectionReason = validatedData.rejectionReason
    }
    
    if (validatedData.notes) {
      updateData.notes = validatedData.notes
    }
    
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email role').populate('roomId', 'name roomId type capacity')
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: `Booking ${validatedData.status} successfully`
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Booking approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require faculty or admin role to view pending bookings
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || 'pending'
    
    // Build filter for pending bookings
    const filter: any = { status }
    
    // If faculty, only show bookings from their department
    const user = (request as any).user
    if (user.role === 'faculty') {
      const { default: User } = await import('@/lib/models/User')
      const facultyUser = await User.findById(user.userId)
      if (facultyUser?.department) {
        // This would need to be implemented based on your data structure
        // For now, we'll show all pending bookings
      }
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const total = await Booking.countDocuments(filter)
    
    // Get pending bookings with pagination and populate related data
    const bookings = await Booking.find(filter)
      .populate('userId', 'name email role department')
      .populate('roomId', 'name roomId type capacity')
      .sort({ createdAt: 1 })
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
    console.error('Pending bookings GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
