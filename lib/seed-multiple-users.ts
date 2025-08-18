import clientPromise from './mongodb'
import { hashPassword } from './auth'

async function seedMultipleUsers() {
  const client = await clientPromise
  const db = client.db()
  const users = db.collection('users')

  // Clear existing users except the test user
  await users.deleteMany({ email: { $ne: 'testuser@example.com' } })

  const usersToSeed = [
    // Students
    {
      email: 'student1@example.com',
      password: await hashPassword('password123'),
      name: 'Alice Johnson',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU001',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student2@example.com',
      password: await hashPassword('password123'),
      name: 'Bob Smith',
      role: 'student',
      department: 'Engineering',
      studentId: 'STU002',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student3@example.com',
      password: await hashPassword('password123'),
      name: 'Carol Davis',
      role: 'student',
      department: 'Mathematics',
      studentId: 'STU003',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student4@example.com',
      password: await hashPassword('password123'),
      name: 'David Wilson',
      role: 'student',
      department: 'Physics',
      studentId: 'STU004',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student5@example.com',
      password: await hashPassword('password123'),
      name: 'Eva Brown',
      role: 'student',
      department: 'Biology',
      studentId: 'STU005',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student6@example.com',
      password: await hashPassword('password123'),
      name: 'Frank Miller',
      role: 'student',
      department: 'Chemistry',
      studentId: 'STU006',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student7@example.com',
      password: await hashPassword('password123'),
      name: 'Grace Lee',
      role: 'student',
      department: 'Psychology',
      studentId: 'STU007',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student8@example.com',
      password: await hashPassword('password123'),
      name: 'Henry Taylor',
      role: 'student',
      department: 'Economics',
      studentId: 'STU008',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student9@example.com',
      password: await hashPassword('password123'),
      name: 'Ivy Chen',
      role: 'student',
      department: 'Computer Science',
      studentId: 'STU009',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'student10@example.com',
      password: await hashPassword('password123'),
      name: 'Jack Anderson',
      role: 'student',
      department: 'Engineering',
      studentId: 'STU010',
      createdAt: new Date().toISOString(),
      status: 'active'
    },

    // Faculty
    {
      email: 'faculty1@example.com',
      password: await hashPassword('password123'),
      name: 'Dr. Sarah Johnson',
      role: 'faculty',
      department: 'Computer Science',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'faculty2@example.com',
      password: await hashPassword('password123'),
      name: 'Prof. Michael Brown',
      role: 'faculty',
      department: 'Engineering',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'faculty3@example.com',
      password: await hashPassword('password123'),
      name: 'Dr. Emily Davis',
      role: 'faculty',
      department: 'Mathematics',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'faculty4@example.com',
      password: await hashPassword('password123'),
      name: 'Prof. Robert Wilson',
      role: 'faculty',
      department: 'Physics',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'faculty5@example.com',
      password: await hashPassword('password123'),
      name: 'Dr. Lisa Garcia',
      role: 'faculty',
      department: 'Biology',
      createdAt: new Date().toISOString(),
      status: 'active'
    },

    // Admin users
    {
      email: 'admin1@example.com',
      password: await hashPassword('password123'),
      name: 'Admin Manager',
      role: 'admin',
      department: 'Administration',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'admin2@example.com',
      password: await hashPassword('password123'),
      name: 'System Administrator',
      role: 'admin',
      department: 'IT Services',
      createdAt: new Date().toISOString(),
      status: 'active'
    },
    {
      email: 'admin3@example.com',
      password: await hashPassword('password123'),
      name: 'Security Manager',
      role: 'admin',
      department: 'Security',
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ]

  // Insert all users
  const result = await users.insertMany(usersToSeed)
  
  console.log(`Seeded ${result.insertedCount} users:`)
  console.log('- 10 Students')
  console.log('- 5 Faculty')
  console.log('- 3 Admin users')
  console.log('- 1 Test user (existing)')
  console.log('Total: 19 users')
  
  process.exit(0)
}

seedMultipleUsers().catch((err) => {
  console.error(err)
  process.exit(1)
})
