import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Room from '@/lib/models/Room'
import { requireRole } from '@/lib/middleware'

const roomQuerySchema = z.object({
  available: z.string().optional(),
  type: z.string().optional(),
  capacity: z.string().optional(),
  equipment: z.string().optional(),
  floor: z.string().optional()
})

const createRoomSchema = z.object({
  roomId: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().min(1),
  floor: z.string().min(1),
  type: z.string().min(1),
  equipment: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  building: z.string().optional(),
  description: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = roomQuerySchema.parse(query)
    
    // Build filter object
    const filter: any = {}
    
    if (validatedQuery.available !== undefined) {
      filter.available = validatedQuery.available === 'true'
    }
    
    if (validatedQuery.type) {
      filter.type = { $regex: validatedQuery.type, $options: 'i' }
    }
    
    if (validatedQuery.capacity) {
      filter.capacity = { $gte: parseInt(validatedQuery.capacity) }
    }
    
    if (validatedQuery.equipment) {
      filter.equipment = { $regex: validatedQuery.equipment, $options: 'i' }
    }
    
    if (validatedQuery.floor) {
      filter.floor = { $regex: validatedQuery.floor, $options: 'i' }
    }
    
    // Only show operational rooms
    filter.maintenanceStatus = 'operational'
    
    const rooms = await Room.find(filter).sort({ roomId: 1 })
    
    return NextResponse.json({
      success: true,
      rooms,
      total: rooms.length
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Rooms GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require admin or faculty role to create rooms
    const authResult = await requireRole(['admin', 'faculty'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = createRoomSchema.parse(body)
    
    // Check if room with this ID already exists
    const existingRoom = await Room.findOne({ roomId: validatedData.roomId })
    if (existingRoom) {
      return NextResponse.json(
        { error: 'Room with this ID already exists' },
        { status: 409 }
      )
    }
    
    const newRoom = new Room({
      roomId: validatedData.roomId,
      name: validatedData.name,
      capacity: validatedData.capacity,
      floor: validatedData.floor,
      type: validatedData.type,
      equipment: validatedData.equipment || [],
      available: validatedData.available !== false,
      building: validatedData.building || 'ELC',
      description: validatedData.description || '',
      maintenanceStatus: 'operational'
    })
    
    await newRoom.save()
    
    return NextResponse.json({
      success: true,
      room: newRoom,
      message: 'Room created successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Rooms POST error:', error)
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Room with this ID already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require admin or faculty role to update rooms
    const authResult = await requireRole(['admin', 'faculty'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!updatedRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      room: updatedRoom,
      message: 'Room updated successfully'
    })
    
  } catch (error) {
    console.error('Rooms PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require admin role to delete rooms
    const authResult = await requireRole(['admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('id')
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      )
    }
    
    // Check if room has active bookings
    const { default: Booking } = await import('@/lib/models/Booking')
    const activeBookings = await Booking.find({
      roomId: roomId,
      status: { $in: ['pending', 'confirmed'] }
    })
    
    if (activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete room with active bookings' },
        { status: 400 }
      )
    }
    
    // Soft delete - mark as unavailable and under maintenance
    const updatedRoom = await Room.findByIdAndUpdate(
      roomId,
      { 
        available: false, 
        maintenanceStatus: 'decommissioned',
        updatedAt: new Date() 
      },
      { new: true }
    )
    
    if (!updatedRoom) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Room decommissioned successfully'
    })
    
  } catch (error) {
    console.error('Rooms DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
