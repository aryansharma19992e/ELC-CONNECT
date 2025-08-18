import clientPromise from './mongodb'
import { hashPassword } from './auth'

async function seedTestUser() {
  const client = await clientPromise
  const db = client.db()
  const users = db.collection('users')

  // Hash the password before storing
  const hashedPassword = await hashPassword('testpassword')

  const testUser = {
    email: 'testuser@example.com',
    password: hashedPassword,
    name: 'Test User',
    role: 'student',
    department: 'Test Department',
    studentId: 'TST123',
    createdAt: new Date().toISOString(),
    status: 'active'
  }

  // Remove if already exists
  await users.deleteOne({ email: testUser.email })
  await users.insertOne(testUser)
  console.log('Seeded test user:', { ...testUser, password: '[HIDDEN]' })
  process.exit(0)
}

seedTestUser().catch((err) => {
  console.error(err)
  process.exit(1)
})
