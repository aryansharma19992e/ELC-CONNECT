import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import User from '@/lib/models/User'
import { authenticateUser, hashPassword, comparePassword } from '@/lib/auth'

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  studentId: z.string().optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional()
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
})

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    
    await dbConnect()
    
    // Get user profile
    const userProfile = await User.findById(user.userId).select('-password')
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: userProfile
    })
    
  } catch (error) {
    console.error('Profile GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)
    
    // Check if user exists
    const existingUser = await User.findById(user.userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if student ID is unique when updating (only for students)
    if (validatedData.studentId && existingUser.role === 'student') {
      const duplicateStudent = await User.findOne({ 
        studentId: validatedData.studentId,
        _id: { $ne: user.userId }
      })
      if (duplicateStudent) {
        return NextResponse.json(
          { error: 'Student ID already exists' },
          { status: 409 }
        )
      }
    }
    
    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      user.userId,
      { ...validatedData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password')
    
    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Profile PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = changePasswordSchema.parse(body)
    
    // Check if user exists
    const existingUser = await User.findById(user.userId)
    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      validatedData.currentPassword, 
      existingUser.password
    )
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }
    
    // Hash new password
    const hashedNewPassword = await hashPassword(validatedData.newPassword)
    
    // Update password
    await User.findByIdAndUpdate(
      user.userId,
      { 
        password: hashedNewPassword, 
        updatedAt: new Date() 
      }
    )
    
    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Profile PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
