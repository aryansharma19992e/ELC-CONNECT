import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data
let rooms = [
  {
    id: '1',
    name: 'Computer Lab 1',
    capacity: 30,
    type: 'computer_lab',
    building: 'Main Building',
    floor: '1st Floor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Conference Room A',
    capacity: 20,
    type: 'conference_room',
    building: 'Main Building',
    floor: '2nd Floor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Library Study Room',
    capacity: 15,
    type: 'study_room',
    building: 'Library',
    floor: '1st Floor',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const roomSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().min(1),
  type: z.enum(['computer_lab', 'conference_room', 'study_room', 'classroom', 'other']),
  building: z.string().min(1),
  floor: z.string().min(1)
})

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      rooms: rooms.filter(room => room.isActive)
    })
  } catch (error) {
    console.error('Rooms GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = roomSchema.parse(body)
    
    const newRoom = {
      ...validatedData,
      id: (rooms.length + 1).toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    rooms.push(newRoom)
    
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
