import { connectToDatabase } from './db'
import { Booking } from './models/Booking'

// Parse times like "11:00 AM" to minutes since midnight
function parseTimeToMinutes(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return -1
  let [, hours, minutes, ampm] = match
  let h = parseInt(hours)
  const m = parseInt(minutes)
  if (ampm.toLowerCase() === 'pm' && h < 12) h += 12
  if (ampm.toLowerCase() === 'am' && h === 12) h = 0
  return h * 60 + m
}

export async function updateCompletedBookings() {
  try {
    await connectToDatabase()
    
    const now = new Date()
    const today = now.toISOString().split('T')[0] // YYYY-MM-DD format
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    
    // Find all confirmed bookings for today
    const todaysConfirmed = await Booking.find({ date: today, status: 'confirmed' })
    const toCompleteIds: string[] = []
    
    for (const booking of todaysConfirmed) {
      const endMinutes = parseTimeToMinutes((booking as any).endTime)
      if (endMinutes >= 0 && currentMinutes >= endMinutes) {
        toCompleteIds.push((booking as any)._id)
      }
    }
    
    if (toCompleteIds.length > 0) {
      await Booking.updateMany({ _id: { $in: toCompleteIds } }, { status: 'completed' })
      console.log(`Updated ${toCompleteIds.length} bookings to completed status`)
    }
    
    return toCompleteIds.length
  } catch (error) {
    console.error('Error updating completed bookings:', error)
    return 0
  }
}

// Function to check if a booking is completed based on time
export function isBookingCompleted(bookingDate: string, bookingEndTime: string): boolean {
  const now = new Date()
  const today = now.toISOString().split('T')[0]
  if (bookingDate !== today) return false
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const endMinutes = parseTimeToMinutes(bookingEndTime)
  return endMinutes >= 0 && currentMinutes >= endMinutes
}
