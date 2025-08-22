import { connectToDatabase } from './db'
import { Booking } from './models/Booking'
import { Room } from './models/Room'

async function seedTestBookings() {
  try {
    await connectToDatabase()
    
    // Get the first room to create a test booking
    const rooms = await Room.find({}).limit(1)
    if (rooms.length === 0) {
      console.log('No rooms found. Please create rooms first.')
      return
    }
    
    const room = rooms[0]
    console.log('Creating test booking for room:', room.name)
    
    // Create a test booking for today at 11:00 AM - 1:00 PM
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    
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
    
    console.log('Test booking created:', testBooking)
    console.log('Room should now show as booked for 11:00 AM - 1:00 PM on', today)
    
  } catch (error) {
    console.error('Error creating test booking:', error)
  }
}

// Run the seed function
seedTestBookings()
  .then(() => {
    console.log('Test booking seeding completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Test booking seeding failed:', error)
    process.exit(1)
  })
