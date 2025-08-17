import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { requireRole } from '@/lib/middleware'

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
    // Require admin or faculty role to view users
    const authResult = await requireRole(['admin', 'faculty'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = userQuerySchema.parse(query)
    
    // Build filter object
    const filter: any = {}
    
    if (validatedQuery.role) {
      filter.role = validatedQuery.role
    }
    
    if (validatedQuery.department) {
      filter.department = { $regex: validatedQuery.department, $options: 'i' }
    }
    
    if (validatedQuery.status) {
      filter.status = validatedQuery.status
    }
    
    if (validatedQuery.search) {
      filter.$or = [
        { name: { $regex: validatedQuery.search, $options: 'i' } },
        { email: { $regex: validatedQuery.search, $options: 'i' } },
        { studentId: { $regex: validatedQuery.search, $options: 'i' } }
      ]
    }
    
    // Pagination
    const page = parseInt(validatedQuery.page || '1')
    const limit = parseInt(validatedQuery.limit || '10')
    const skip = (page - 1) * limit
    
    // Get total count for pagination
    const total = await User.countDocuments(filter)
    
    // Get users with pagination
    const users = await User.find(filter)
      .select('-password') // Exclude password from response
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
    
    return NextResponse.json({
      success: true,
      users,
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
    // Require admin role to create users
    const authResult = await requireRole(['admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email })
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
      const existingStudent = await User.findOne({ studentId: validatedData.studentId })
      if (existingStudent) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        )
      }
    }
    
    // Create new user (without password - they'll need to set it via email)
    const newUser = new User({
      email: validatedData.email,
      role: validatedData.role,
      name: validatedData.name,
      department: validatedData.department,
      studentId: validatedData.role === 'student' ? validatedData.studentId : undefined,
      status: validatedData.status,
      // Set a temporary password that user must change
      password: 'temp-password-' + Date.now()
    })
    
    await newUser.save()
    
    // Return user data without password
    const userData = newUser.toJSON()
    delete userData.password
    
    return NextResponse.json({
      success: true,
      user: userData,
      message: 'User created successfully. They will need to set their password.'
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
    // Require admin role to update users
    const authResult = await requireRole(['admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
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
    const existingUser = await User.findById(userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if student ID is unique when updating
    if (validatedData.studentId && existingUser.role === 'student') {
      const duplicateStudent = await User.findOne({ 
        studentId: validatedData.studentId,
        _id: { $ne: userId }
      })
      if (duplicateStudent) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password')
    
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
    // Require admin role to delete users
    const authResult = await requireRole(['admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Check if user exists
    const existingUser = await User.findById(userId)
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
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { status: 'inactive', updatedAt: new Date() },
      { new: true }
    ).select('-password')
    
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

