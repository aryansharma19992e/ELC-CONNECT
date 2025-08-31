"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, Plus, BookOpen, Bell, Settings, LogOut, CheckCircle, AlertCircle, TrendingUp, UserCheck, Building2 } from "lucide-react"
import Link from "next/link"
import { ClientWrapper, useLocalStorage } from "@/components/client-wrapper"

interface AdminUser {
  id?: string
  name: string
  role: string
  department: string
  email: string
  avatar?: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { getItem, setItem, clear, isClient } = useLocalStorage()

  const [user, setUser] = useState<AdminUser>({
    id: "",
    name: "",
    role: "",
    department: "",
    email: "",
    avatar: "/student-avatar.png",
  })
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState<'pending' | 'active' | 'inactive' | 'suspended' | 'rejected' | ''>('')
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRooms: 0,
    pendingBookings: 0,
    roomUsage: [] as Array<{ name: string; bookings: number; capacity: number }>,
    userDistribution: [] as Array<{ role: string; count: number }>,
    recentBookings: [] as Array<{
      id: string
      userName: string
      roomName: string
      date: string
      time: string
      status: string
    }>,
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!isClient) return

    const token = getItem("token")
    const stored = getItem("user")

    if (!token || !stored) {
      setLoading(false)
      router.push("/login")
      return
    }

    let u: any = null
    try {
      u = stored ? JSON.parse(stored) : null
    } catch (err) {
      console.error('Invalid user data in storage, clearing…', err)
      clear()
      setLoading(false)
      router.push('/login')
      return
    }
    if (!u) {
      setLoading(false)
      router.push('/login')
      return
    }

    // Check if user is admin
    if (u.role !== 'admin') {
      setLoading(false)
      router.push('/dashboard')
      return
    }

    setUser({
      id: u.id,
      name: u.name || "",
      role: (u.role || "").charAt(0).toUpperCase() + (u.role || "").slice(1),
      department: u.department || "",
      email: u.email || "",
      avatar: "/student-avatar.png",
    })

    setStatus(u.status || '')

    async function loadDashboardData() {
      try {
        // Fetch dashboard data
        const res = await fetch('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })

        if (res.ok) {
          const data = await res.json()
          setDashboardData(data)
        } else {
          console.error('Failed to fetch dashboard data')
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadDashboardData()
    setLoading(false)
  }, [router, isClient])

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (status && status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
            <CardDescription>Your account is currently {status}. You will gain access once an admin approves your request.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">You can close this tab and check back later. This page will update automatically after approval.</p>
            <Button onClick={() => window.location.reload()} className="bg-blue-600 hover:bg-blue-700">Refresh Status</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <ClientWrapper>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">ELC Connect</h1>
                  <p className="text-xs text-gray-500">Admin Dashboard</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>
                      {(user.name || "A")
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name || "Admin"}</p>
                    <p className="text-xs text-gray-500">{user.role || "Admin"}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { clear(); router.push("/login") }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name || "Admin"}!</h1>
            <p className="text-gray-600">
              {user.department || "-"} • {user.role || "Admin"}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.totalUsers}</p>
                  </div>
                  <UserCheck className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.totalBookings}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.totalRooms}</p>
                  </div>
                  <Building2 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Bookings</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.pendingBookings}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/admin/bookings">
                      <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                        <Calendar className="w-6 h-6" />
                        <span className="text-sm">Manage Bookings</span>
                      </Button>
                    </Link>

                    <Link href="/admin/users">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                      >
                        <Users className="w-6 h-6" />
                        <span className="text-sm">Manage Users</span>
                      </Button>
                    </Link>

                    <Link href="/admin/rooms">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                      >
                        <Building2 className="w-6 h-6" />
                        <span className="text-sm">Manage Rooms</span>
                      </Button>
                    </Link>

                    <Link href="/admin/resources">
                      <Button
                        variant="outline"
                        className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                      >
                        <BookOpen className="w-6 h-6" />
                        <span className="text-sm">Manage Resources</span>
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Bookings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Bookings</CardTitle>
                    <CardDescription>Latest room reservation requests</CardDescription>
                  </div>
                  <Link href="/admin/bookings">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dashboardData.recentBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{booking.userName}</h4>
                            <p className="text-sm text-gray-600">{booking.roomName}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {booking.date} • {booking.time}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {booking.status === 'confirmed' ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">Confirmed</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Room Usage */}
              <Card>
                <CardHeader>
                  <CardTitle>Room Usage This Week</CardTitle>
                  <CardDescription>Booking activity by day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.roomUsage.map((day, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{day.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">{day.bookings} bookings</span>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min((day.bookings / day.capacity) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>User Distribution</CardTitle>
                  <CardDescription>Users by role</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dashboardData.userDistribution.map((role, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 capitalize">{role.role}</span>
                        <Badge variant="secondary">{role.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ClientWrapper>
  )
}
