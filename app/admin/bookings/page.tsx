"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, MapPin, Users, Check, X, ArrowLeft, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BookingItem {
  id: string
  userId: string
  userName?: string
  roomId: string
  roomName?: string
  date: string
  startTime: string
  endTime: string
  purpose?: string
  attendees?: number
  equipment?: string[]
  status: string
  createdAt: string
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [bookings, setBookings] = useState<BookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [totalBookings, setTotalBookings] = useState(0)

  async function refresh() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    try {
      setLoading(true)
      const params = new URLSearchParams({
        limit: '50'
      })
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }

      const res = await fetch(`/api/bookings?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const json = await res.json()
      if (json?.success) {
        setBookings(json.bookings || [])
        setTotalBookings(json.total || 0)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        const superEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL
        setIsSuperAdmin(!!u.isSuperAdmin && (!superEmail || u.email === superEmail))
      }
    } catch {}
    refresh() 
  }, [statusFilter])

  async function approve(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    try {
      const response = await fetch(`/api/bookings/approve?id=${encodeURIComponent(id)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        await refresh()
      } else {
        alert('Failed to approve booking')
      }
    } catch (error) {
      console.error('Error approving booking:', error)
      alert('Failed to approve booking')
    }
  }

  async function reject(id: string) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return

    try {
      const response = await fetch(`/api/bookings?id=${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (response.ok) {
        await refresh()
      } else {
        alert('Failed to reject booking')
      }
    } catch (error) {
      console.error('Error rejecting booking:', error)
      alert('Failed to reject booking')
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    return timeString
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Bookings Management</h1>
                <p className="text-sm text-gray-500">Manage all booking requests and approvals</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bookings</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <div className="ml-auto">
                <Badge className="bg-blue-100 text-blue-800">
                  Total: {totalBookings}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              {statusFilter === 'all' 
                ? 'All booking requests in the system' 
                : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} booking requests`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading bookings...</span>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {statusFilter === 'all' 
                    ? 'No bookings found in the system' 
                    : `No ${statusFilter} bookings found`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className={`flex items-start justify-between p-4 border rounded-lg ${
                      booking.status === 'pending' 
                        ? 'bg-yellow-50 border-yellow-200' 
                        : booking.status === 'confirmed'
                        ? 'bg-green-50 border-green-200'
                        : booking.status === 'cancelled'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-medium text-gray-900">
                          {booking.roomName || booking.roomId}
                        </span>
                        <Badge className={getStatusBadgeColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{booking.userName || 'Unknown User'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                        </div>
                      </div>
                      {booking.purpose && (
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Purpose:</strong> {booking.purpose}
                        </p>
                      )}
                      {booking.attendees && (
                        <p className="text-sm text-gray-600">
                          <strong>Attendees:</strong> {booking.attendees}
                        </p>
                      )}
                      {booking.equipment && booking.equipment.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <strong>Equipment:</strong> {booking.equipment.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    {booking.status === 'pending' && (
                      <div className="flex space-x-2 ml-4">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => approve(booking.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => reject(booking.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {booking.status === 'confirmed' && (
                      <div className="ml-4">
                        <Badge className="bg-green-100 text-green-800">
                          <Check className="w-4 h-4 mr-1" />
                          Confirmed
                        </Badge>
                      </div>
                    )}
                    
                    {booking.status === 'cancelled' && (
                      <div className="ml-4">
                        <Badge className="bg-red-100 text-red-800">
                          <X className="w-4 h-4 mr-1" />
                          Cancelled
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


