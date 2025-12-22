import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/db'
import { Booking } from '@/lib/models/Booking'
import { Attendance } from '@/lib/models/Attendance'
import { requireAuth } from '@/lib/auth-guard'
import { generateAttendanceQR } from '@/lib/qr-generator'

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
    const booking = await Booking.findById(bookingId).populate('roomId', 'name').populate('userId') as any
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Check if booking is approved
    if (booking.status !== 'confirmed') {
      return NextResponse.json({ error: 'QR code only available for confirmed bookings' }, { status: 400 })
    }

    // Google Form URL
    const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdepUVI9aUnu_Z7sdNLL21qD6e5YPRd5n9WnfBXlGC0SUqhBg/viewform'

    // Get user details
    const user = booking.userId;

    if (!user || typeof user !== 'object') {
      console.error('User not found or not populated for booking:', bookingId);
      return NextResponse.json({ error: 'User details could not be retrieved' }, { status: 500 });
    }

    // Map fields:
    const params = new URLSearchParams()
    params.append('usp', 'pp_url')
    if (user.employeeId) params.append('entry.959984559', user.employeeId)
    if (user.name) params.append('entry.726004286', user.name)
    if (user.department) params.append('entry.393130259', user.department)
    if (user.phone) params.append('entry.1906449228', user.phone)
    if (user.email) params.append('entry.362957536', user.email)

    const formUrl = `${GOOGLE_FORM_URL}?${params.toString()}`

    // Check if QR code already exists
    let attendance = await Attendance.findOne({ bookingId: booking._id })

    if (!attendance) {
      // Generate QR code pointing to the Google Form
      const qrCodeDataURL = await generateAttendanceQR(formUrl)

      // Create attendance record
      attendance = await Attendance.create({
        userId: user._id, // Use validated user._id
        roomId: booking.roomId?._id || booking.roomId,
        bookingId: booking._id,
        date: booking.date,
        qrCode: qrCodeDataURL,
        qrCodeData: formUrl, // Store URL instead of JSON
        status: 'absent' // Default status
      })
    } else if (attendance.qrCodeData !== formUrl) {
      // Update existing attendance if URL has changed (or was old JSON)
      const qrCodeDataURL = await generateAttendanceQR(formUrl)
      attendance.qrCode = qrCodeDataURL
      attendance.qrCodeData = formUrl
      await attendance.save()
    }

    return NextResponse.json({
      success: true,
      qrCode: attendance.qrCode,
      qrData: attendance.qrCodeData, // Return the URL/string directly
      booking: {
        id: (booking._id as any).toString(),
        roomName: (booking.roomId as any)?.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status
      },
      attendance: {
        id: (attendance._id as any).toString(),
        status: attendance.status,
        checkInTime: attendance.checkInTime,
        checkOutTime: attendance.checkOutTime
      }
    })
  } catch (error: any) {
    console.error('QR generation error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message || 'Unknown error'
    }, { status: 500 })
  }
}
