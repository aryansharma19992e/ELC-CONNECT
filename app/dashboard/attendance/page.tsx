"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, QrCode, Camera, CheckCircle, XCircle, Clock, MapPin, Users } from "lucide-react"
import Link from "next/link"
import QRScanner from "@/components/QRScanner"
import jsQR from 'jsqr'

interface Booking {
  id: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  status: string
}

interface AttendanceRecord {
  id: string
  bookingId: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  status: string
  checkInTime?: string
  checkOutTime?: string
}

export default function AttendancePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [myBookings, setMyBookings] = useState<Booking[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [qrCode, setQrCode] = useState<string>('')
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string } | null>(null)

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
    
    if (!token || !stored) {
      router.push("/login")
      return
    }

    const u = JSON.parse(stored)
    setUser(u)
    loadData(u.id, token)
  }, [router])

  const loadData = async (userId: string, token: string) => {
    try {
      // Load confirmed bookings
      const bookingsRes = await fetch(`/api/bookings?userId=${userId}&status=confirmed&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const bookingsData = await bookingsRes.json()
      
      if (bookingsData.success) {
        const bookings = bookingsData.bookings.map((b: any) => ({
          id: b.id,
          roomName: b.roomName || b.roomId,
          date: b.date,
          startTime: b.startTime,
          endTime: b.endTime,
          purpose: b.purpose,
          status: b.status
        }))
        setMyBookings(bookings)
      }

      // Load attendance records
      const attendanceRes = await fetch(`/api/attendance?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const attendanceData = await attendanceRes.json()
      
      if (attendanceData.success) {
        const records = attendanceData.attendance.map((a: any) => ({
          id: a.id,
          bookingId: a.bookingId,
          roomName: a.roomName,
          date: a.date,
          startTime: a.bookingStartTime,
          endTime: a.bookingEndTime,
          status: a.status,
          checkInTime: a.checkInTime,
          checkOutTime: a.checkOutTime
        }))
        setAttendanceRecords(records)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateQRCode = async (booking: Booking) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/attendance/qr?bookingId=${booking.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      const data = await response.json()
      if (data.success) {
        setQrCode(data.qrCode)
        setSelectedBooking(booking)
      } else {
        alert(data.error || 'Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      alert('Failed to generate QR code')
    }
  }

  const handleQRScan = async (qrData: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/attendance/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ qrData }),
      })
      
      const data = await response.json()
      setScanResult({
        success: data.success,
        message: data.message || data.error
      })
      
      // Reload attendance records
      if (data.success && user) {
        const attendanceRes = await fetch(`/api/attendance?userId=${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const attendanceData = await attendanceRes.json()
        if (attendanceData.success) {
          const records = attendanceData.attendance.map((a: any) => ({
            id: a.id,
            bookingId: a.bookingId,
            roomName: a.roomName,
            date: a.date,
            startTime: a.bookingStartTime,
            endTime: a.bookingEndTime,
            status: a.status,
            checkInTime: a.checkInTime,
            checkOutTime: a.checkOutTime
          }))
          setAttendanceRecords(records)
        }
      }
    } catch (error) {
      console.error('Error scanning QR code:', error)
      setScanResult({
        success: false,
        message: 'Failed to process QR code'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>
      case 'absent':
        return <Badge className="bg-red-100 text-red-800">Absent</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Attendance Management</h1>
                <p className="text-xs text-gray-500">QR Code Attendance System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="my-qr" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-qr">My QR Codes</TabsTrigger>
            <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
            <TabsTrigger value="history">Attendance History</TabsTrigger>
          </TabsList>

          <TabsContent value="my-qr" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* My Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>My Confirmed Bookings</CardTitle>
                  <CardDescription>Generate QR codes for your confirmed bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {myBookings.length > 0 ? (
                      myBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{booking.roomName}</h4>
                            <p className="text-sm text-gray-600">{booking.purpose}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {booking.date} • {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => generateQRCode(booking)}
                            className="ml-4"
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Generate QR
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No confirmed bookings found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* QR Code Display */}
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                  <CardDescription>
                    {selectedBooking ? `QR code for ${selectedBooking.roomName}` : 'Select a booking to generate QR code'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {qrCode ? (
                    <div className="text-center">
                      <img src={qrCode} alt="QR Code" className="mx-auto max-w-xs" />
                      <p className="text-sm text-gray-600 mt-2">
                        Valid from 5 minutes before start time
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <QrCode className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No QR code generated</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scan" className="space-y-6">
            <div className="max-w-md mx-auto">
              <QRScanner
                onScan={handleQRScan}
                onError={(error) => setScanResult({ success: false, message: error })}
                isScanning={isScanning}
                onToggleScanning={() => setIsScanning(!isScanning)}
              />
              
              {scanResult && (
                <Alert className={`mt-4 ${scanResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  {scanResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={scanResult.success ? 'text-green-800' : 'text-red-800'}>
                    {scanResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>Your attendance records for all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{record.roomName}</h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {record.date} • {record.startTime} - {record.endTime}
                            </span>
                            {record.checkInTime && (
                              <span className="text-xs text-gray-500">
                                Check-in: {record.checkInTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(record.status)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No attendance records found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
