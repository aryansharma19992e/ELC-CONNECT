import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { Booking } from '@/lib/models/Booking'
import { requireAuth, requireRole, requireAdmin } from '@/lib/auth-guard'

const bookingSchema = z.object({
  userId: z.string().min(1),
  roomId: z.string().min(1),
  date: z.string().min(1),
  startTime: z.string().min(1), // This will be like "11:00 AM"
  endTime: z.string().min(1), // This will be like "1:00 PM"
  purpose: z.string().min(1), // Required by the database model
  attendees: z.number().optional(),
  equipment: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const query: any = {}
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    if (userId) query.userId = userId
    if (roomId) query.roomId = roomId
    if (date) query.date = date
    if (status) query.status = status

    const [items, total] = await Promise.all([
      Booking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('roomId', 'name'),
      Booking.countDocuments(query)
    ])

    const bookings = items.map((b: any) => ({
      id: b._id.toString(),
      userId: b.userId.toString(),
      // roomId may be populated doc or ObjectId; normalize to string _id
      roomId: (b.roomId?._id ? b.roomId._id : b.roomId).toString(),
      roomName: b.roomId?.name,
      date: b.date,
      startTime: b.startTime,
      endTime: b.endTime,
      purpose: b.purpose,
      attendees: b.attendees,
      equipment: b.equipment || [],
      status: b.status,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt
    }))

    return NextResponse.json({ success: true, bookings, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    // Additionally ensure user is active
    const userId = guard.ctx.userId
    // Lazy import to avoid cycle
    const { User } = await import('@/lib/models/User')
    const requester = await User.findById(userId)
    if (!requester || requester.status !== 'active') {
      return NextResponse.json({ error: 'Account pending approval' }, { status: 403 })
    }
    await connectToDatabase()
    const body = await request.json()
    const validated = bookingSchema.parse(body)

    // Use the separate startTime and endTime from the request
    const startTime = validated.startTime
    const endTime = validated.endTime

    // Convert to minutes for comparison
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

    const startMinutes = parseTime(startTime)
    const endMinutes = parseTime(endTime)
    
    if (startMinutes >= endMinutes) {
      return NextResponse.json({ error: 'End time must be after start time' }, { status: 400 })
    }

    // Check for conflicts (pending or confirmed block the slot)
    const existingBookings = await Booking.find({ 
      roomId: validated.roomId, 
      date: validated.date, 
      status: { $in: ['pending', 'confirmed'] }
    })

    for (const booking of existingBookings) {
      const existingStart = parseTime(booking.startTime)
      const existingEnd = parseTime(booking.endTime)
      if (startMinutes < existingEnd && endMinutes > existingStart) {
        return NextResponse.json({ error: 'Room is already booked for this time period' }, { status: 409 })
      }
    }

    const created = await Booking.create({ 
      ...validated, 
      status: 'pending' 
    })
    return NextResponse.json({ success: true, booking: {
      id: created._id.toString(),
      userId: created.userId.toString(),
      roomId: created.roomId.toString(),
      date: created.date,
      startTime: created.startTime,
      endTime: created.endTime,
      purpose: created.purpose,
      attendees: created.attendees,
      equipment: created.equipment || [],
      status: created.status,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    }, message: 'Booking created successfully' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Bookings POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })

    const body = await request.json()
    await Booking.updateOne({ _id: id }, { $set: { ...body } })
    const updated = await Booking.findById(id)
    if (!updated) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    return NextResponse.json({ success: true, booking: {
      id: updated._id.toString(),
      userId: updated.userId.toString(),
      roomId: updated.roomId.toString(),
      date: updated.date,
      startTime: updated.startTime,
      endTime: updated.endTime,
      purpose: updated.purpose,
      attendees: updated.attendees,
      equipment: updated.equipment || [],
      status: updated.status,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }, message: 'Booking updated successfully' })
  } catch (error) {
    console.error('Bookings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })

    const existing = await Booking.findById(id)
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Check if user is admin or the owner of the booking
    const isAdmin = guard.ctx.role === 'admin'
    const isOwner = existing.userId.toString() === guard.ctx.userId

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Unauthorized to cancel this booking' }, { status: 403 })
    }

    // Instead of deleting, update the status to cancelled
    await Booking.updateOne({ _id: id }, { $set: { status: 'cancelled' } })
    return NextResponse.json({ success: true, message: 'Booking cancelled successfully' })
  } catch (error) {
    console.error('Bookings DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

