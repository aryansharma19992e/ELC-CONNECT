import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Booking } from '@/lib/models/Booking'
import { requireRole } from '@/lib/auth-guard'

export async function POST(request: NextRequest) {
  try {
    const guard = requireRole(request, ['admin'])
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })

    const booking = await Booking.findById(id)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // Before confirming, ensure no conflict with other confirmed bookings
    const conflict = await Booking.findOne({
      _id: { $ne: booking._id },
      roomId: booking.roomId,
      date: booking.date,
      status: 'confirmed',
      $expr: {
        $and: [
          { $lt: ['$startTime', booking.endTime] },
          { $gt: ['$endTime', booking.startTime] }
        ]
      }
    })
    if (conflict) return NextResponse.json({ error: 'Conflict with an existing confirmed booking' }, { status: 409 })

    booking.status = 'confirmed'
    await booking.save()

    return NextResponse.json({ success: true, booking: {
      id: booking._id.toString(),
      userId: booking.userId.toString(),
      roomId: booking.roomId.toString(),
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      purpose: booking.purpose,
      attendees: booking.attendees,
      equipment: booking.equipment || [],
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    }, message: 'Booking approved' })
  } catch (error) {
    console.error('Approve booking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


