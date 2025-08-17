import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock users for authentication
const mockUsers = [
  {
    id: '1',
    email: 'admin@elc.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
    department: 'IT'
  },
  {
    id: '2',
    email: 'faculty@elc.com',
    password: 'faculty123',
    name: 'John Faculty',
    role: 'faculty',
    department: 'Computer Science'
  },
  {
    id: '3',
    email: 'student@elc.com',
    password: 'student123',
    name: 'Alice Student',
    role: 'student',
    department: 'Computer Science'
  }
]

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)
    
    // Find user by email
    const user = mockUsers.find(u => u.email === validatedData.email)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Check password (in real app, use bcrypt)
    if (user.password !== validatedData.password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }
    
    // Create simple token (in real app, use JWT)
    const token = `mock-token-${user.id}-${Date.now()}`
    
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
