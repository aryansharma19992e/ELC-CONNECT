import dotenv from 'dotenv'
// Load .env.local first (Next.js convention), then fallback to .env
dotenv.config({ path: '.env.local' })
dotenv.config()
import { connectToDatabase } from './db'
import { User } from './models/User'
import { Room } from './models/Room'
import { Resource } from './models/Resource'
import { hashPassword } from './auth'

async function main() {
  await connectToDatabase()

  // Ensure indexes exist
  await Promise.all([
    User.syncIndexes(),
    Room.syncIndexes(),
    Resource.syncIndexes()
  ])

  // Users
  const existingAdmin = await User.findOne({ email: 'admin@university.edu' })
  if (!existingAdmin) {
    await User.create({
      email: 'admin@university.edu',
      password: await hashPassword('password123'),
      name: 'Admin User',
      role: 'admin',
      department: 'IT',
      status: 'active'
    })
  }

  const existingFaculty = await User.findOne({ email: 'faculty@university.edu' })
  if (!existingFaculty) {
    await User.create({
      email: 'faculty@university.edu',
      password: await hashPassword('password123'),
      name: 'Faculty User',
      role: 'faculty',
      department: 'Computer Science',
      status: 'active'
    })
  }

  const existingStudent = await User.findOne({ email: 'student@university.edu' })
  if (!existingStudent) {
    await User.create({
      email: 'student@university.edu',
      password: await hashPassword('password123'),
      name: 'Student User',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU1001',
      status: 'active'
    })
  }

  // Rooms
  const ensureRoom = async (room: any) => {
    const existing = await Room.findOne({ name: room.name })
    if (!existing) await Room.create(room)
  }

  // Always ensure required rooms exist (idempotent)
  const requiredRooms: Array<any> = [
    // Ground Floor: 5 Engineering Design spaces
    { name: 'ED-01', capacity: 12, type: 'other', building: 'ELC', floor: 'Ground Floor', description: 'Engineering Design Space', equipment: ['Projector', 'WiFi', 'Whiteboard'] },
    { name: 'ED-02', capacity: 12, type: 'other', building: 'ELC', floor: 'Ground Floor', description: 'Engineering Design Space', equipment: ['Projector', 'WiFi', 'Whiteboard'] },
    { name: 'ED-03', capacity: 10, type: 'other', building: 'ELC', floor: 'Ground Floor', description: 'Engineering Design Space', equipment: ['WiFi', 'Whiteboard'] },
    { name: 'ED-04', capacity: 10, type: 'other', building: 'ELC', floor: 'Ground Floor', description: 'Engineering Design Space', equipment: ['WiFi', 'Whiteboard'] },
    { name: 'ED-05', capacity: 8, type: 'other', building: 'ELC', floor: 'Ground Floor', description: 'Engineering Design Space', equipment: ['WiFi'] },
    // 1st Floor: ELC rooms (2) and Meeting rooms (2)
    { name: 'ELC-101', capacity: 30, type: 'classroom', building: 'ELC', floor: '1st Floor', description: 'ELC Room', equipment: ['Projector', 'WiFi'] },
    { name: 'ELC-102', capacity: 30, type: 'classroom', building: 'ELC', floor: '1st Floor', description: 'ELC Room', equipment: ['Projector', 'WiFi'] },
    { name: 'MR-1F-A', capacity: 12, type: 'conference_room', building: 'ELC', floor: '1st Floor', description: 'Meeting Room', equipment: ['Whiteboard', 'WiFi'] },
    { name: 'MR-1F-B', capacity: 12, type: 'conference_room', building: 'ELC', floor: '1st Floor', description: 'Meeting Room', equipment: ['Whiteboard', 'WiFi'] },
    // 2nd Floor: Activity spaces (3) and Meeting rooms (2)
    { name: 'ACT-201', capacity: 20, type: 'other', building: 'ELC', floor: '2nd Floor', description: 'Activity Space', equipment: ['Projector', 'WiFi', 'Speakers'] },
    { name: 'ACT-202', capacity: 20, type: 'other', building: 'ELC', floor: '2nd Floor', description: 'Activity Space', equipment: ['Projector', 'WiFi', 'Speakers'] },
    { name: 'ACT-203', capacity: 16, type: 'other', building: 'ELC', floor: '2nd Floor', description: 'Activity Space', equipment: ['WiFi', 'Speakers'] },
    { name: 'MR-2F-A', capacity: 10, type: 'conference_room', building: 'ELC', floor: '2nd Floor', description: 'Meeting Room', equipment: ['Whiteboard', 'WiFi'] },
    { name: 'MR-2F-B', capacity: 10, type: 'conference_room', building: 'ELC', floor: '2nd Floor', description: 'Meeting Room', equipment: ['Whiteboard', 'WiFi'] },
  ]

  for (const r of requiredRooms) {
    await ensureRoom(r)
  }

  // Resources
  const resourcesCount = await Resource.countDocuments()
  if (resourcesCount === 0) {
    await Resource.insertMany([
      { title: 'Intro to Algorithms', type: 'textbook', category: 'CS', author: 'Cormen', tags: ['algorithms', 'cs'] },
      { title: 'Operating Systems Slides', type: 'presentation', category: 'CS', author: 'Dr. Smith', tags: ['os', 'slides'] },
      { title: 'Database Lecture Video', type: 'video', category: 'CS', author: 'Dr. Lee', tags: ['db', 'video'] }
    ])
  }

  console.log('Seed completed')
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})


