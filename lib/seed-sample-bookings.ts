import clientPromise from './mongodb'

async function seedSampleBookings() {
  const client = await clientPromise
  const db = client.db()
  const bookings = db.collection('bookings')

  // Clear existing bookings
  await bookings.deleteMany({})

  // Get some users to assign bookings to
  const users = db.collection('users')
  const userList = await users.find({}).limit(5).toArray()
  
  if (userList.length === 0) {
    console.log('No users found. Please seed users first.')
    process.exit(1)
  }

  // Create sample bookings for the past week
  const today = new Date()
  const sampleBookings = []

  // Generate bookings for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate 3-8 bookings per day
    const bookingsPerDay = Math.floor(Math.random() * 6) + 3
    
    for (let j = 0; j < bookingsPerDay; j++) {
      const user = userList[Math.floor(Math.random() * userList.length)]
      const startHour = Math.floor(Math.random() * 12) + 8 // 8 AM to 8 PM
      const duration = Math.floor(Math.random() * 3) + 1 // 1-3 hours
      
      const booking = {
        userId: user._id,
        userName: user.name,
        roomId: `room-${Math.floor(Math.random() * 10) + 1}`,
        roomName: `Room ${Math.floor(Math.random() * 10) + 1}`,
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${(startHour + duration).toString().padStart(2, '0')}:00`,
        purpose: ['Study Session', 'Group Meeting', 'Presentation', 'Lab Work', 'Research'][Math.floor(Math.random() * 5)],
        attendees: Math.floor(Math.random() * 10) + 1,
        equipment: ['Projector', 'Whiteboard', 'Computers'].slice(0, Math.floor(Math.random() * 3) + 1),
        status: ['pending', 'approved', 'completed'][Math.floor(Math.random() * 3)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      sampleBookings.push(booking)
    }
  }

  // Insert all bookings
  const result = await bookings.insertMany(sampleBookings)
  
  console.log(`Seeded ${result.insertedCount} sample bookings`)
  console.log('Bookings created for the past 7 days with varying usage patterns')
  
  process.exit(0)
}

seedSampleBookings().catch((err) => {
  console.error(err)
  process.exit(1)
})
