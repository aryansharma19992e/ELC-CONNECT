import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth-guard'
import crypto from 'crypto'

const schema = z.object({
  userId: z.string().min(1),
  roomId: z.string().min(1),
  date: z.string().min(1)
})

export async function POST(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    const body = await request.json()
    const data = schema.parse(body)

    const payload = `${data.userId}:${data.roomId}:${data.date}:${Date.now()}`
    const qrCode = crypto.createHash('sha256').update(payload).digest('hex')

    return NextResponse.json({ success: true, qrCode })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('QR generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


