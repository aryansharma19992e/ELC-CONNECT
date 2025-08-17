import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Room from '@/lib/models/Room'
import { requireRole } from '@/lib/middleware'
import crypto from 'crypto'

const generateQRSchema = z.object({
  roomId: z.string().min(1),
  expiryMinutes: z.number().min(1).max(1440).optional() // Max 24 hours
})

export async function POST(request: NextRequest) {
  try {
    // Require faculty or admin role to generate QR codes
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = generateQRSchema.parse(body)
    
    // Verify room exists
    const room = await Room.findById(validatedData.roomId)
    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      )
    }
    
    // Generate unique QR code
    const timestamp = Date.now()
    const randomString = crypto.randomBytes(8).toString('hex')
    const qrCode = `QR_${room.roomId}_${timestamp}_${randomString}`
    
    // Calculate expiry time
    const expiryMinutes = validatedData.expiryMinutes || 60 // Default 1 hour
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000)
    
    // Store QR code data (in production, you might want to store this in a separate collection)
    const qrData = {
      qrCode,
      roomId: validatedData.roomId,
      roomName: room.name,
      generatedBy: (request as any).user.userId,
      generatedAt: new Date(),
      expiryTime,
      isActive: true
    }
    
    // For now, we'll return the QR code data
    // In production, you might want to:
    // 1. Store this in a QRCode collection
    // 2. Generate an actual QR code image
    // 3. Implement QR code validation and expiry
    
    return NextResponse.json({
      success: true,
      qrCode,
      roomName: room.name,
      expiryTime,
      message: 'QR code generated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('QR generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Require faculty or admin role to view QR codes
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const active = searchParams.get('active') === 'true'
    
    // Build filter
    const filter: any = { isActive: active !== false }
    
    if (roomId) {
      filter.roomId = roomId
    }
    
    // For now, return a message about QR code management
    // In production, you would query your QRCode collection
    return NextResponse.json({
      success: true,
      message: 'QR code management endpoint',
      note: 'This endpoint would return active QR codes for the specified room'
    })
    
  } catch (error) {
    console.error('QR codes GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
