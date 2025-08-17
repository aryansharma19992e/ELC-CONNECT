import dbConnect from './mongodb'
import User from './models/User'
import Room from './models/Room'
import Resource from './models/Resource'
import { hashPassword } from './auth'

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    await dbConnect()
    
    // Clear existing data
    await User.deleteMany({})
    await Room.deleteMany({})
    await Resource.deleteMany({})
    
    console.log('🗑️  Cleared existing data')
    
    // Create admin user
    const adminPassword = await hashPassword('admin123')
    const adminUser = await User.create({
      email: 'admin@elc.edu',
      password: adminPassword,
      name: 'System Administrator',
      role: 'admin',
      department: 'Administration',
      status: 'active'
    })
    
    // Create faculty user
    const facultyPassword = await hashPassword('faculty123')
    const facultyUser = await User.create({
      email: 'faculty@elc.edu',
      password: facultyPassword,
      name: 'Dr. Sarah Johnson',
      role: 'faculty',
      department: 'Computer Science',
      status: 'active'
    })
    
    // Create student user
    const studentPassword = await hashPassword('student123')
    const studentUser = await User.create({
      email: 'student@elc.edu',
      password: studentPassword,
      name: 'John Doe',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU123456',
      status: 'active'
    })
    
    console.log('👥 Created users')
    
    // Create rooms
    const rooms = await Room.create([
      {
        roomId: 'A-201',
        name: 'Computer Lab A-201',
        capacity: 30,
        floor: '2nd Floor',
        type: 'computer_lab',
        equipment: ['Computers', 'Projector', 'Whiteboard'],
        available: true,
        building: 'ELC',
        description: 'Main computer laboratory with 30 workstations',
        maintenanceStatus: 'operational'
      },
      {
        roomId: 'B-105',
        name: 'Conference Room B-105',
        capacity: 20,
        floor: '1st Floor',
        type: 'conference',
        equipment: ['Projector', 'Whiteboard', 'Video Conferencing'],
        available: true,
        building: 'ELC',
        description: 'Conference room for meetings and presentations',
        maintenanceStatus: 'operational'
      },
      {
        roomId: 'C-301',
        name: 'Study Room C-301',
        capacity: 8,
        floor: '3rd Floor',
        type: 'study',
        equipment: ['Whiteboard', 'Tables', 'Chairs'],
        available: true,
        building: 'ELC',
        description: 'Quiet study room for small groups',
        maintenanceStatus: 'operational'
      }
    ])
    
    console.log('🏠 Created rooms')
    
    // Create resources
    const resources = await Resource.create([
      {
        title: 'Introduction to Computer Science',
        type: 'document',
        category: 'Computer Science',
        description: 'Comprehensive guide to CS fundamentals and programming basics',
        author: 'Dr. Smith',
        fileUrl: 'https://example.com/cs-intro.pdf',
        fileSize: 2048,
        fileType: 'pdf',
        tags: ['programming', 'algorithms', 'data-structures'],
        isPublic: true,
        accessLevel: 'public',
        department: 'Computer Science',
        status: 'active'
      },
      {
        title: 'Advanced Algorithms',
        type: 'document',
        category: 'Computer Science',
        description: 'Advanced algorithmic concepts and problem-solving techniques',
        author: 'Dr. Johnson',
        fileUrl: 'https://example.com/advanced-algo.pdf',
        fileSize: 3072,
        fileType: 'pdf',
        tags: ['algorithms', 'complexity', 'optimization'],
        isPublic: true,
        accessLevel: 'public',
        department: 'Computer Science',
        status: 'active'
      },
      {
        title: 'Database Design Principles',
        type: 'video',
        category: 'Information Technology',
        description: 'Video tutorial on database design and normalization',
        author: 'Prof. Williams',
        fileUrl: 'https://example.com/db-design.mp4',
        fileSize: 51200,
        fileType: 'mp4',
        tags: ['database', 'design', 'normalization'],
        isPublic: true,
        accessLevel: 'public',
        department: 'Information Technology',
        status: 'active'
      }
    ])
    
    console.log('📚 Created resources')
    
    console.log('✅ Database seeding completed successfully!')
    console.log('\n📋 Sample Data Created:')
    console.log(`👥 Users: ${await User.countDocuments()}`)
    console.log(`🏠 Rooms: ${await Room.countDocuments()}`)
    console.log(`📚 Resources: ${await Resource.countDocuments()}`)
    console.log('\n🔑 Test Credentials:')
    console.log('Admin: admin@elc.edu / admin123')
    console.log('Faculty: faculty@elc.edu / faculty123')
    console.log('Student: student@elc.edu / student123')
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase

