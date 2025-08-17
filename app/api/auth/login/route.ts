import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { comparePassword, generateToken } from '@/lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['student', 'faculty', 'admin'])
})

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { email, password, role } = loginSchema.parse(body)

    // Find user by email and role
    const user = await User.findOne({ email, role, status: 'active' })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials or account is inactive' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    })

    // Return user data without password
    const userData = user.toJSON()

    return NextResponse.json({
      success: true,
      user: userData,
      token,
      message: 'Login successful'
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
