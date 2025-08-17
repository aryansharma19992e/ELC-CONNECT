import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock users storage
let mockUsers = [
  {
    id: '1',
    email: 'admin@elc.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    department: 'IT',
    studentId: '',
    createdAt: new Date().toISOString()
  }
]

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  role: z.enum(['student', 'faculty', 'admin']),
  department: z.string().min(1),
  studentId: z.string().optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = signupSchema.parse(body)
    
    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === validatedData.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }
    
    // Check if student ID is required for students
    if (validatedData.role === 'student' && !validatedData.studentId) {
      return NextResponse.json(
        { error: 'Student ID is required for student accounts' },
        { status: 400 }
      )
    }
    
    // Check if student ID is unique for students
    if (validatedData.role === 'student' && validatedData.studentId) {
      const existingStudent = mockUsers.find(user => user.studentId === validatedData.studentId)
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        )
      }
    }
    
    // Create new user
    const newUser = {
      ...validatedData,
      id: (mockUsers.length + 1).toString(),
      createdAt: new Date().toISOString()
    }
    
    mockUsers.push(newUser)
    
    // Return user data without password
    const { password, ...userData } = newUser
    
    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userData
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
