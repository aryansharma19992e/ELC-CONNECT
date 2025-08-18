import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
<<<<<<< HEAD
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { signToken, verifyPassword } from '@/lib/auth'
import { authRateLimit } from '@/lib/rate-limit'
=======
import clientPromise from '../../../../lib/mongodb'
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['student', 'faculty', 'admin']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const limited = authRateLimit(request)
    if (limited) return limited
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

<<<<<<< HEAD
    await connectToDatabase()

    const user = await User.findOne({ email: validatedData.email })
=======
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('users')

    // Find user by email
    const user = await collection.findOne({ email: validatedData.email })
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

<<<<<<< HEAD
    const ok = await verifyPassword(validatedData.password, user.password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (validatedData.role && user.role !== validatedData.role) {
      return NextResponse.json({ error: 'Role mismatch' }, { status: 403 })
    }

    const token = signToken({ sub: user._id.toString(), role: user.role })
=======
    // Check password (plain text for now)
    if (user.password !== validatedData.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create simple token (in real app, use JWT)
    const token = `mock-token-${user._id}-${Date.now()}`

    // Return user data without password
    const { password, ...userData } = user
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        status: user.status,
        createdAt: user.createdAt
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
