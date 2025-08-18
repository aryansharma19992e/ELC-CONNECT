import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { Room } from '@/lib/models/Room'
import { requireRole } from '@/lib/auth-guard'

const roomSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().min(1),
  type: z.enum(['computer_lab', 'conference_room', 'study_room', 'classroom', 'other']),
  building: z.string().min(1),
  floor: z.string().min(1),
  description: z.string().optional(),
  equipment: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const query: any = { isActive: true }
    const available = searchParams.get('available')
    const type = searchParams.get('type')
    const capacity = searchParams.get('capacity')
    const equipment = searchParams.get('equipment')
    const floor = searchParams.get('floor')

    if (type) query.type = type
    if (floor) query.floor = floor
    if (capacity) query.capacity = { $gte: Number(capacity) }
    if (available !== null) {
      // available maps loosely to isActive for this mock; real availability would be computed
      query.isActive = available === 'true'
    }
    if (equipment) {
      query.equipment = { $in: [equipment] }
    }

    const items = await Room.find(query).sort({ createdAt: -1 })
    const rooms = items.map(r => ({
      id: r._id.toString(),
      name: r.name,
      capacity: r.capacity,
      type: r.type,
      building: r.building,
      floor: r.floor,
      description: r.description,
      equipment: r.equipment || [],
      available: r.isActive,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
    return NextResponse.json({ success: true, rooms, total: rooms.length })
  } catch (error) {
    console.error('Rooms GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = requireRole(request, ['admin'])
    if (guard.error) return guard.error
    await connectToDatabase()
    const body = await request.json()
    const validatedData = roomSchema.parse(body)

    const created = await Room.create(validatedData)
    return NextResponse.json({ success: true, room: created, message: 'Room created successfully' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Rooms POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
