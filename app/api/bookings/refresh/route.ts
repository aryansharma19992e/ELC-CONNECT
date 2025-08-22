import { NextRequest, NextResponse } from 'next/server'
import { updateCompletedBookings } from '@/lib/update-completed-bookings'
import { requireAuth } from '@/lib/auth-guard'

export async function GET(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    // Only run update if the requested date is today
    const today = new Date().toISOString().split('T')[0]
    let updated = 0
    if (date === today) {
      updated = await updateCompletedBookings()
    }

    return NextResponse.json({ success: true, updated })
  } catch (error) {
    console.error('Bookings refresh error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


