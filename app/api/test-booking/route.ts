import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Booking } from '@/lib/models/Booking'
import { Room } from '@/lib/models/Room'

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    
    // Get the first room
    const rooms = await Room.find({}).limit(1)
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'No rooms found' }, { status: 404 })
    }
    
    const room = rooms[0]
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
    // Create a test booking
    const testBooking = await Booking.create({
      userId: '507f1f77bcf86cd799439011', // Mock user ID
      roomId: room._id,
      date: today,
      startTime: '11:00 AM',
      endTime: '1:00 PM',
      purpose: 'Test booking for availability checking',
      attendees: 5,
      equipment: ['Whiteboard', 'WiFi'],
      status: 'confirmed'
    })
    
    return NextResponse.json({ 
      success: true, 
      booking: testBooking,
      message: `Test booking created for room ${room.name} on ${today} from 11:00 AM to 1:00 PM`
    })
    
  } catch (error) {
    console.error('Test booking creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    
    const today = new Date().toISOString().split('T')[0]
    const bookings = await Booking.find({ date: today }).populate('roomId', 'name')
    
    return NextResponse.json({ 
      success: true, 
      bookings: bookings.map(b => ({
        id: b._id.toString(),
        roomId: (b.roomId?._id ? b.roomId._id : b.roomId).toString(),
        roomName: b.roomId?.name,
        date: b.date,
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status,
        purpose: b.purpose
      })),
      date: today
    })
    
  } catch (error) {
    console.error('Test booking fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
