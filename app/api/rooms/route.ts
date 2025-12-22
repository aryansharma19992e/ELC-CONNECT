import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { Room } from '@/lib/models/Room'
import { requireAdmin } from '@/lib/auth-guard'
import { cachedGeneralApi, cacheInvalidation } from '@/lib/cached-api'

type CachedRoom = {
  _id?: { toString(): string } | string
  id?: string
  name: string
  capacity: number
  type: string
  building?: string
  floor?: string
  description?: string
  equipment?: string[]
  isActive?: boolean
  available?: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

type RoomsCacheResult = { rooms: CachedRoom[]; total: number }

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
    const { searchParams } = new URL(request.url)
    
    // Build filters for caching
    const filters: Record<string, any> = {}
    const available = searchParams.get('available')
    const type = searchParams.get('type')
    const capacity = searchParams.get('capacity')
    const equipment = searchParams.get('equipment')
    const floor = searchParams.get('floor')

    if (type) filters.type = type
    if (floor) filters.floor = floor
    if (capacity) filters.capacity = parseInt(capacity)
    if (available !== null) {
      filters.available = available === 'true'
    }
    if (equipment) {
      filters.equipment = equipment
    }

    // Try to get from cache first
    const cachedResult = await cachedGeneralApi.getRooms(filters) as RoomsCacheResult | null
    
    // Only use cache when it contains a non-empty rooms array
    if (cachedResult && Array.isArray(cachedResult.rooms) && cachedResult.rooms.length > 0) {
      const rooms = cachedResult.rooms.map((r: CachedRoom) => ({
        id: r._id ? r._id.toString() : r.id,
        name: r.name,
        capacity: r.capacity,
        type: r.type,
        building: r.building,
        floor: r.floor,
        description: r.description,
        equipment: r.equipment || [],
        available: r.isActive ?? r.available ?? true,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt
      }))
      
      return NextResponse.json({ 
        success: true, 
        rooms, 
        total: cachedResult.total,
        cached: true
      })
    }

    // Fallback to database if cache miss
    await connectToDatabase()
    
    const query: any = {}
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
      id: String(r._id),
      name: r.name,
      capacity: r.capacity,
      type: r.type,
      building: r.building,
      floor: r.floor,
      description: r.description,
      equipment: r.equipment || [],
      available: (r as any).isActive ?? (r as any).available ?? true,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }))
    
    return NextResponse.json({ 
      success: true, 
      rooms, 
      total: rooms.length,
      cached: false
    })
  } catch (error) {
    console.error('Rooms GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const body = await request.json()
    const validatedData = roomSchema.parse(body)

    const created = await Room.create(validatedData)
    
    // Invalidate rooms cache after creating new room
    await cacheInvalidation.invalidateRooms()
    
    return NextResponse.json({ success: true, room: created, message: 'Room created successfully' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Rooms POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
