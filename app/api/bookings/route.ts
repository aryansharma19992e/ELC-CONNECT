import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data
let bookings = [
  {
    id: '1',
    userId: '3',
    roomId: '1',
    startTime: '2024-01-15T09:00:00Z',
    endTime: '2024-01-15T11:00:00Z',
    purpose: 'Study session',
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const bookingSchema = z.object({
  userId: z.string().min(1),
  roomId: z.string().min(1),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  purpose: z.string().min(1)
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const total = bookings.length
    const paginatedBookings = bookings.slice(skip, skip + limit)
    
    return NextResponse.json({
      success: true,
      bookings: paginatedBookings,
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
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)
    
    // Check for booking conflicts (simple check)
    const conflictingBooking = bookings.find(booking => 
      booking.roomId === validatedData.roomId &&
      booking.status === 'confirmed' &&
      new Date(validatedData.startTime) < new Date(booking.endTime) &&
      new Date(validatedData.endTime) > new Date(booking.startTime)
    )
    
    if (conflictingBooking) {
      return NextResponse.json(
        { error: 'Room is already booked for this time period' },
        { status: 409 }
      )
    }
    
    const newBooking = {
      ...validatedData,
      id: (bookings.length + 1).toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    bookings.push(newBooking)
    
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
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const existingBooking = bookings.find(booking => booking.id === bookingId)
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    const updatedBooking = { ...existingBooking, ...body, updatedAt: new Date().toISOString() }
    const bookingIndex = bookings.findIndex(booking => booking.id === bookingId)
    bookings[bookingIndex] = updatedBooking
    
    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully'
    })
    
  } catch (error) {
    console.error('Bookings PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    
    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      )
    }
    
    const existingBooking = bookings.find(booking => booking.id === bookingId)
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    // Remove booking
    bookings = bookings.filter(booking => booking.id !== bookingId)
    
    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully'
    })
    
  } catch (error) {
    console.error('Bookings DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

