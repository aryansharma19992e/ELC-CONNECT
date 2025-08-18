import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
<<<<<<< HEAD
import { connectToDatabase } from '@/lib/db'
import { Attendance } from '@/lib/models/Attendance'
import { requireAuth, requireRole } from '@/lib/auth-guard'
=======
import clientPromise from '../../../lib/mongodb'
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501

const attendanceSchema = z.object({
  userId: z.string().min(1),
  roomId: z.string().min(1),
  date: z.string().min(1),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  status: z.enum(['present', 'absent', 'late', 'early_departure']).default('present'),
  qrCode: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

<<<<<<< HEAD
    const query: any = {}
    const userId = searchParams.get('userId')
    const roomId = searchParams.get('roomId')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    if (userId) query.userId = userId
    if (roomId) query.roomId = roomId
    if (date) query.date = date
    if (status) query.status = status

    const [items, total] = await Promise.all([
      Attendance.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Attendance.countDocuments(query)
    ])

    const attendance = items.map(a => ({
      id: a._id.toString(),
      userId: a.userId.toString(),
      roomId: a.roomId.toString(),
      date: a.date,
      checkInTime: a.checkInTime,
      checkOutTime: a.checkOutTime,
      status: a.status,
      qrCode: a.qrCode,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt
    }))

    return NextResponse.json({ success: true, attendance, total, page, limit, totalPages: Math.ceil(total / limit) })
=======
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
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501
  } catch (error) {
    console.error('Attendance GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const body = await request.json()
<<<<<<< HEAD
    const validated = attendanceSchema.parse(body)

    const exists = await Attendance.findOne({ userId: validated.userId, roomId: validated.roomId, date: validated.date })
    if (exists) return NextResponse.json({ error: 'Attendance record already exists for this user, room, and date' }, { status: 409 })

    const created = await Attendance.create(validated)
    return NextResponse.json({ success: true, attendance: {
      id: created._id.toString(),
      userId: created.userId.toString(),
      roomId: created.roomId.toString(),
      date: created.date,
      checkInTime: created.checkInTime,
      checkOutTime: created.checkOutTime,
      status: created.status,
      qrCode: created.qrCode,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt
    }, message: 'Attendance recorded successfully' }, { status: 201 })
=======
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
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Attendance POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = requireRole(request, ['admin', 'faculty'])
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
<<<<<<< HEAD
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })

    const body = await request.json()
    await Attendance.updateOne({ _id: id }, { $set: body })
    const updated = await Attendance.findById(id)
    if (!updated) return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    return NextResponse.json({ success: true, attendance: {
      id: updated._id.toString(),
      userId: updated.userId.toString(),
      roomId: updated.roomId.toString(),
      date: updated.date,
      checkInTime: updated.checkInTime,
      checkOutTime: updated.checkOutTime,
      status: updated.status,
      qrCode: updated.qrCode,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt
    }, message: 'Attendance updated successfully' })
=======
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
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501
  } catch (error) {
    console.error('Attendance PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = requireRole(request, ['admin'])
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
<<<<<<< HEAD
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })

    const existing = await Attendance.findById(id)
    if (!existing) return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })

    await Attendance.deleteOne({ _id: id })
    return NextResponse.json({ success: true, message: 'Attendance record deleted successfully' })
=======
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
>>>>>>> 0c49cc69221556288192b4306b06f7c3f2e7a501
  } catch (error) {
    console.error('Attendance DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

