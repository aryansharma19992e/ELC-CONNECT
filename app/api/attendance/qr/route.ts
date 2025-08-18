import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Booking } from '@/lib/models/Booking'
import { Attendance } from '@/lib/models/Attendance'
import { requireAuth } from '@/lib/auth-guard'
import { generateAttendanceQR, AttendanceQRData } from '@/lib/qr-generator'

export async function GET(request: NextRequest) {
  try {
    const guard = requireAuth(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')
    
    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 })
    }
    
    // Get the booking details
    const booking = await Booking.findById(bookingId).populate('roomId', 'name')
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    
    // Check if booking is approved
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'QR code only available for confirmed bookings' }, { status: 400 })
    }
    
    // Check if QR code already exists
    let attendance = await Attendance.findOne({ bookingId: booking._id })
    
    if (!attendance) {
      // Calculate QR code expiration (5 minutes before start time)
      const bookingDate = new Date(booking.date)
      const [startHour, startMinute] = booking.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || []
      
      if (!startHour) {
        return NextResponse.json({ error: 'Invalid booking time format' }, { status: 400 })
      }
      
      let startH = parseInt(startHour)
      const startM = parseInt(startMinute)
      
      // Convert to 24-hour format
      if (booking.startTime.includes('PM') && startH < 12) startH += 12
      if (booking.startTime.includes('AM') && startH === 12) startH = 0
      
      const qrStartTime = new Date(bookingDate)
      qrStartTime.setHours(startH, startM - 5, 0, 0) // 5 minutes before start
      
      const qrExpiresAt = new Date(bookingDate)
      qrExpiresAt.setHours(startH, startM, 0, 0) // Expires at start time
      
      // Create QR code data
      const qrData: AttendanceQRData = {
        bookingId: booking._id.toString(),
        userId: booking.userId.toString(),
        roomId: booking.roomId.toString(),
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        expiresAt: qrExpiresAt.toISOString()
      }
      
      // Generate QR code
      const qrCodeDataURL = await generateAttendanceQR(qrData)
      
      // Create attendance record
      attendance = await Attendance.create({
        userId: booking.userId,
        roomId: booking.roomId,
        bookingId: booking._id,
        date: booking.date,
        qrCode: qrCodeDataURL,
        qrCodeData: JSON.stringify(qrData),
        status: 'absent' // Default status, will be updated when scanned
      })
    }
    
    return NextResponse.json({
      success: true,
      qrCode: attendance.qrCode,
      qrData: attendance.qrCodeData ? JSON.parse(attendance.qrCodeData) : null,
      booking: {
        id: booking._id.toString(),
        roomName: booking.roomId?.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      },
      attendance: {
        id: attendance._id.toString(),
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime
      }
    })
  } catch (error) {
    console.error('QR generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
