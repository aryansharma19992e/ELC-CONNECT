import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Attendance } from '@/lib/models/Attendance'
import { Booking } from '@/lib/models/Booking'
import { requireAuth } from '@/lib/auth-guard'
import { parseQRData, isQRValid } from '@/lib/qr-generator'

export async function POST(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    
    const body = await request.json()
    const { qrData } = body
    
    if (!qrData) {
      return NextResponse.json({ error: 'QR data is required' }, { status: 400 })
    }
    
    // Parse QR data
    const parsedQRData = parseQRData(qrData)
    if (!parsedQRData) {
      return NextResponse.json({ error: 'Invalid QR code data' }, { status: 400 })
    }
    
    // Validate QR code
    if (!isQRValid(parsedQRData)) {
      return NextResponse.json({ 
        error: 'QR code is invalid or expired. Please ensure you are scanning within the valid time window (5 minutes before start time to end time).' 
      }, { status: 400 })
    }
    
    // Get the attendance record
    const attendance = await Attendance.findOne({ 
      bookingId: parsedQRData.bookingId,
      userId: parsedQRData.userId 
    }).populate('bookingId', 'roomId startTime endTime')
    
    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }
    
    // Check if already marked present
    if (attendance.status === 'present') {
      return NextResponse.json({ 
        success: true, 
        message: 'Attendance already marked',
        attendance: {
          id: attendance._id.toString(),
          status: attendance.status,
          checkInTime: attendance.checkInTime,
          checkOutTime: attendance.checkOutTime
        }
      })
    }
    
    // Determine if late (more than 5 minutes after start time)
    const now = new Date()
    const bookingDate = new Date(parsedQRData.date)
    const [startHour, startMinute] = parsedQRData.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || []
    
    let startH = parseInt(startHour)
    const startM = parseInt(startMinute)
    
    // Convert to 24-hour format
    if (parsedQRData.startTime.includes('PM') && startH < 12) startH += 12
    if (parsedQRData.startTime.includes('AM') && startH === 12) startH = 0
    
    const bookingStart = new Date(bookingDate)
    bookingStart.setHours(startH, startM, 0, 0)
    
    const lateThreshold = new Date(bookingStart)
    lateThreshold.setMinutes(lateThreshold.getMinutes() + 5)
    
    const status = now > lateThreshold ? 'late' : 'present'
    const checkInTime = now.toLocaleTimeString('en-US', { 
      hour12: true, 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    // Update attendance
    attendance.status = status
    attendance.checkInTime = checkInTime
    await attendance.save()
    
    return NextResponse.json({
      success: true,
      message: `Attendance marked successfully. Status: ${status}`,
      attendance: {
        id: attendance._id.toString(),
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime
      }
    })
  } catch (error) {
    console.error('QR scan error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
