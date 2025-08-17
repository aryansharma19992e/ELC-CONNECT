import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { hashPassword } from '@/lib/auth'

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  studentId: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(['student', 'faculty']),
  department: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    await dbConnect()
    
    const body = await request.json()
    const { firstName, lastName, password, role, department, studentId, email } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if student ID is required for students
    if (role === 'student' && !studentId) {
      return NextResponse.json(
        { error: 'Student ID is required for student accounts' },
        { status: 400 }
      )
    }

    // Check if student ID is unique for students
    if (role === 'student' && studentId) {
      const existingStudent = await User.findOne({ studentId })
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        )
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      name: `${firstName} ${lastName}`,
      department,
      studentId: role === 'student' ? studentId : undefined,
      status: 'active'
    })

    await newUser.save()

    // Return user data without password
    const userData = newUser.toJSON()

    return NextResponse.json({
      success: true,
      user: userData,
      message: 'User created successfully'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
