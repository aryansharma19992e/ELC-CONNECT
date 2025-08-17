import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data
let users = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@elc.com',
    role: 'admin',
    department: 'IT',
    studentId: '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'John Faculty',
    email: 'john@elc.com',
    role: 'faculty',
    department: 'Computer Science',
    studentId: '',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Alice Student',
    email: 'alice@elc.com',
    role: 'student',
    department: 'Computer Science',
    studentId: 'CS001',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const userQuerySchema = z.object({
  role: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

const createUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['student', 'faculty', 'admin']),
  name: z.string().min(1),
  department: z.string().min(1),
  studentId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active')
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  studentId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = userQuerySchema.parse(query)
    
    // Apply filters
    let filteredUsers = [...users]
    
    if (validatedQuery.role) {
      filteredUsers = filteredUsers.filter(user => user.role === validatedQuery.role)
    }
    
    if (validatedQuery.department) {
      filteredUsers = filteredUsers.filter(user => 
        user.department?.toLowerCase().includes(validatedQuery.department!.toLowerCase())
      )
    }
    
    if (validatedQuery.status) {
      filteredUsers = filteredUsers.filter(user => user.status === validatedQuery.status)
    }
    
    if (validatedQuery.search) {
      const searchTerm = validatedQuery.search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.name?.toLowerCase().includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm) ||
        user.studentId?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Sort by createdAt (newest first)
    filteredUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Pagination
    const page = parseInt(validatedQuery.page || '1')
    const limit = parseInt(validatedQuery.limit || '10')
    const skip = (page - 1) * limit
    const total = filteredUsers.length
    
    // Apply pagination
    const paginatedUsers = filteredUsers.slice(skip, skip + limit)
    
    return NextResponse.json({
      success: true,
      users: paginatedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Users GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)
    
    // Check if user already exists
    const existingUser = users.find(user => user.email === validatedData.email)
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
      const existingStudent = users.find(user => user.studentId === validatedData.studentId)
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
      id: (users.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    users.push(newUser)
    
    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Users POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)
    
    // Check if user exists
    const existingUser = users.find(user => user.id === userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if student ID is unique when updating
    if (validatedData.studentId && existingUser.role === 'student') {
      const duplicateStudent = users.find(user => 
        user.studentId === validatedData.studentId && user.id !== userId
      )
      if (duplicateStudent) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update user
    const updatedUser = { ...existingUser, ...validatedData, updatedAt: new Date().toISOString() }
    const userIndex = users.findIndex(user => user.id === userId)
    users[userIndex] = updatedUser
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Users PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = users.find(user => user.id === userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Prevent admin from deleting themselves
    if (existingUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 400 }
      )
    }
    
    // Soft delete - mark as inactive
    const userIndex = users.findIndex(user => user.id === userId)
    users[userIndex] = { ...existingUser, status: 'inactive', updatedAt: new Date().toISOString() }
    
    return NextResponse.json({
      success: true,
      message: 'User deactivated successfully'
    })
    
  } catch (error) {
    console.error('Users DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

