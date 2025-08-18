import clientPromise from './mongodb'

async function seedTestUser() {
  const client = await clientPromise
  const db = client.db()
  const users = db.collection('users')

  const testUser = {
    email: 'testuser@example.com',
    password: 'testpassword',
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
  console.log('Seeded test user:', testUser)
  process.exit(0)
}

seedTestUser().catch((err) => {
  console.error(err)
  process.exit(1)
})
