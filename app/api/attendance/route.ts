import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import clientPromise from '../../../lib/mongodb'

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

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('attendance')

    const total = await collection.countDocuments()
    const attendance = await collection.find({})
      .skip(skip)
      .limit(limit)
      .toArray()

    return NextResponse.json({
      success: true,
      attendance,
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

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('attendance')

    // Check if attendance already exists for this user, room, and date
    const existingAttendance = await collection.findOne({
      userId: validatedData.userId,
      roomId: validatedData.roomId,
      date: validatedData.date
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this user, room, and date' },
        { status: 409 }
      )
    }

    // Insert first to get the insertedId
    const insertResult = await collection.insertOne({
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    const newAttendance = {
      ...validatedData,
      id: insertResult.insertedId.toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    // Update the document to add the id field
    await collection.updateOne(
      { _id: insertResult.insertedId },
      { $set: { id: newAttendance.id } }
    )

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
    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('attendance')

    const existingAttendance = await collection.findOne({ id: attendanceId })
    if (!existingAttendance) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

    const updatedAttendance = {
      ...existingAttendance,
      ...body,
      updatedAt: new Date().toISOString()
    }

    await collection.updateOne(
      { id: attendanceId },
      { $set: updatedAttendance }
    )

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

    const client = await clientPromise
    const db = client.db()
    const collection = db.collection('attendance')

    const result = await collection.deleteOne({ id: attendanceId })
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      )
    }

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

