"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, Check, X, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BookingItem {
  id: string
  userId: string
  roomId: string
  roomName?: string
  date: string
  startTime: string
  endTime: string
  purpose?: string
  attendees?: number
  equipment?: string[]
  status: string
}

export default function AdminBookingsPage() {
  const [pending, setPending] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const res = await fetch('/api/bookings?status=pending&limit=50', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    const json = await res.json()
    if (json?.success) setPending(json.bookings || [])
    setLoading(false)
  }

  useEffect(() => { refresh() }, [])

  async function approve(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await fetch(`/api/bookings/approve?id=${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
    await refresh()
  }

  async function reject(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: 'cancelled' }),
    })
    await refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Bookings Approvals</h1>
                <p className="text-sm text-gray-500">Approve or reject pending booking requests</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests</CardTitle>
            <CardDescription>Waiting for administrator action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading && <div>Loading...</div>}
              {!loading && pending.length === 0 && (
                <div className="text-sm text-gray-600">No pending requests</div>
              )}
              {pending.map((b) => (
                <div key={b.id} className="flex items-start justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-medium text-gray-900">{b.roomName || b.roomId}</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" />{b.date}</span>
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{b.startTime} - {b.endTime}</span>
                      <span className="flex items-center"><Users className="w-4 h-4 mr-1" />{b.attendees || 0} people</span>
                    </div>
                    {b.purpose && <p className="text-sm text-gray-700 mt-2">{b.purpose}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-green-600 hover:bg-green-700" size="sm" onClick={() => approve(b.id)}>
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" className="bg-transparent" onClick={() => reject(b.id)}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


