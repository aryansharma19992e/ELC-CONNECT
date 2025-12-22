import QRCode from 'qrcode'

export interface AttendanceQRData {
  bookingId: string
  userId: string
  roomId: string
  date: string
  startTime: string
  endTime: string
  expiresAt: string
}

export async function generateAttendanceQR(data: AttendanceQRData | string): Promise<string> {
  try {
    const qrData = typeof data === 'string' ? data : JSON.stringify(data)
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export function parseQRData(qrData: string): AttendanceQRData | null {
  try {
    const data = JSON.parse(qrData)
    return data as AttendanceQRData
  } catch (error) {
    console.error('Error parsing QR data:', error)
    return null
  }
}

export function isQRValid(qrData: AttendanceQRData): boolean {
  const now = new Date()
  const expiresAt = new Date(qrData.expiresAt)

  // Check if QR code has expired
  if (now > expiresAt) {
    return false
  }

  // Check if we're within the booking time window (5 minutes before start to end time)
  const bookingDate = new Date(qrData.date)
  const [startHour, startMinute] = qrData.startTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || []
  const [endHour, endMinute] = qrData.endTime.match(/(\d+):(\d+)\s*(AM|PM)/i)?.slice(1) || []

  if (!startHour || !endHour) return false

  let startH = parseInt(startHour)
  let endH = parseInt(endHour)
  const startM = parseInt(startMinute)
  const endM = parseInt(endMinute)

  // Convert to 24-hour format
  if (qrData.startTime.includes('PM') && startH < 12) startH += 12
  if (qrData.startTime.includes('AM') && startH === 12) startH = 0
  if (qrData.endTime.includes('PM') && endH < 12) endH += 12
  if (qrData.endTime.includes('AM') && endH === 12) endH = 0

  const bookingStart = new Date(bookingDate)
  bookingStart.setHours(startH, startM - 5, 0, 0) // 5 minutes before start

  const bookingEnd = new Date(bookingDate)
  bookingEnd.setHours(endH, endM, 0, 0)

  return now >= bookingStart && now <= bookingEnd
}
