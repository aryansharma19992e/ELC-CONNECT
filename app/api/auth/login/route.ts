import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '../../../../lib/mongodb'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('users')

    // Find user by email
    const user = await collection.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

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

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: userData,
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
