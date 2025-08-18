"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Edit, Trash2, ArrowLeft, Plus, QrCode } from "lucide-react"
import Link from "next/link"

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([])
  const [pastBookings, setPastBookings] = useState<any[]>([])

  async function load() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (!token || !stored) return
    const u = JSON.parse(stored)
    const res = await fetch(`/api/bookings?userId=${encodeURIComponent(u.id || '')}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const json = await res.json()
    if (json?.success) {
      const list = json.bookings.map((b: any) => ({
        id: b.id,
        room: b.roomName || b.roomId,
        date: b.date,
        time: `${b.startTime} - ${b.endTime}`,
        purpose: b.purpose,
        attendees: b.attendees || 0,
        status: b.status,
        equipment: b.equipment || [],
        qrCode: null,
      }))
      setBookings(list.filter((b: any) => b.status === 'pending' || b.status === 'confirmed'))
      setPastBookings(list.filter((b: any) => b.status === 'completed' || b.status === 'cancelled'))
    }
  }

  useEffect(() => { load() }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Cancel this booking?")) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await fetch(`/api/bookings?id=${encodeURIComponent(bookingId)}`, {
      method: 'DELETE',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    await load()
  }

  const handleGenerateQR = async (bookingId: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch('/api/attendance/qr-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ userId: 'self', roomId: bookingId, date: new Date().toISOString().slice(0,10) })
    })
    const json = await res.json()
    if (json?.success) alert('QR generated: ' + json.qrCode)
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
                <h1 className="text-lg font-semibold text-gray-900">My Bookings</h1>
                <p className="text-sm text-gray-500">Manage your room reservations</p>
              </div>
            </div>
            <Link href="/dashboard/book-room">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Booking
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                  <p className="text-gray-600 text-center mb-4">You don't have any room reservations scheduled.</p>
                  <Link href="/dashboard/book-room">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Book a Room
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.room}</h3>
                          <Badge className={getStatusColor(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-3">{booking.purpose}</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(booking.date).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {booking.time}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {booking.attendees} attendees
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {booking.equipment.map((item, index) => (
                            <Badge key={index} variant="secondary">
                              {item}
                            </Badge>
                          ))}
                        </div>

                        {booking.qrCode && (
                          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                            <QrCode className="w-4 h-4" />
                            <span>QR Code: {booking.qrCode}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Modify
                        </Button>
                        {!booking.qrCode && booking.status === "confirmed" && (
                          <Button variant="outline" size="sm" onClick={() => handleGenerateQR(booking.id)}>
                            <QrCode className="w-4 h-4 mr-2" />
                            Get QR
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastBookings.map((booking) => (
              <Card key={booking.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.room}</h3>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>

                      <p className="text-gray-700 mb-3">{booking.purpose}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(booking.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {booking.time}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {booking.attendees} attendees
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {booking.equipment.map((item, index) => (
                          <Badge key={index} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>

                      {booking.feedback && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Feedback:</strong> {booking.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button variant="outline" size="sm">
                        Book Again
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
