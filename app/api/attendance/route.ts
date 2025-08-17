import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data
let attendance = [
  {
    id: '1',
    userId: '3',
    roomId: '1',
    date: '2024-01-15',
    checkInTime: '09:00:00',
    checkOutTime: '11:00:00',
    status: 'present',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const attendanceSchema = z.object({
  userId: z.string().min(1),
  roomId: z.string().min(1),
  date: z.string().min(1),
  checkInTime: z.string().min(1),
  checkOutTime: z.string().optional(),
  status: z.enum(['present', 'late', 'absent']).default('present')
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const total = attendance.length
    const paginatedAttendance = attendance.slice(skip, skip + limit)
    
    return NextResponse.json({
      success: true,
      attendance: paginatedAttendance,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = attendanceSchema.parse(body)
    
    // Check if attendance already exists for this user, room, and date
    const existingAttendance = attendance.find(record => 
      record.userId === validatedData.userId &&
      record.roomId === validatedData.roomId &&
      record.date === validatedData.date
    )
    
    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this user, room, and date' },
        { status: 409 }
      )
    }
    
    const newAttendance = {
      ...validatedData,
      id: (attendance.length + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    attendance.push(newAttendance)
    
    return NextResponse.json({
      success: true,
      attendance: newAttendance,
      message: 'Attendance recorded successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Attendance POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attendanceId = searchParams.get('id')
    
    if (!attendanceId) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const existingAttendance = attendance.find(record => record.id === attendanceId)
    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }
    
    const updatedAttendance = { ...existingAttendance, ...body, updatedAt: new Date().toISOString() }
    const attendanceIndex = attendance.findIndex(record => record.id === attendanceId)
    attendance[attendanceIndex] = updatedAttendance
    
    return NextResponse.json({
      success: true,
      attendance: updatedAttendance,
      message: 'Attendance updated successfully'
    })
    
  } catch (error) {
    console.error('Attendance PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const attendanceId = searchParams.get('id')
    
    if (!attendanceId) {
      return NextResponse.json(
        { error: 'Attendance ID is required' },
        { status: 400 }
      )
    }
    
    const existingAttendance = attendance.find(record => record.id === attendanceId)
    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }
    
    // Remove attendance record
    attendance = attendance.filter(record => record.id !== attendanceId)
    
    return NextResponse.json({
      success: true,
      message: 'Attendance record deleted successfully'
    })
    
  } catch (error) {
    console.error('Attendance DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

