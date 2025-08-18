"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import {
  Calendar,
  Users,
  MapPin,
  Shield,
  Settings,
  Bell,
  LogOut,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Monitor,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState({
    name: "Admin User",
    role: "System Administrator",
    email: "admin@university.edu",
    avatar: "/admin-avatar.png",
  })

  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    activeBookings: 0,
    totalRooms: 0,
    systemUptime: "99.8%",
    todayBookings: 0,
    pendingApprovals: 0,
    securityAlerts: 0,
    maintenanceIssues: 0,
  })

  const [pendingBookings, setPendingBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const [roomUsageData] = useState([
    { name: "Mon", bookings: 65, capacity: 80 },
    { name: "Tue", bookings: 72, capacity: 80 },
    { name: "Wed", bookings: 78, capacity: 80 },
    { name: "Thu", bookings: 85, capacity: 80 },
    { name: "Fri", bookings: 92, capacity: 80 },
    { name: "Sat", bookings: 45, capacity: 80 },
    { name: "Sun", bookings: 32, capacity: 80 },
  ])

  const [userTypeData] = useState([
    { name: "Students", value: 892, color: "#3B82F6" },
    { name: "Faculty", value: 245, color: "#10B981" },
    { name: "Staff", value: 110, color: "#F59E0B" },
  ])

  const [recentActivity, setRecentActivity] = useState([])
  const [alerts, setAlerts] = useState([])

  // Fetch real data from the database
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (!token || !user) {
        router.push('/login')
        return
      }

      try {
        const userData = JSON.parse(user)
        if (userData.role !== 'admin') {
          router.push('/dashboard')
          return
        }

        setAdmin({
          name: userData.name || "Admin User",
          role: "System Administrator",
          email: userData.email || "admin@university.edu",
          avatar: "/admin-avatar.png",
        })

        // Fetch system statistics
        const [usersRes, bookingsRes, roomsRes, pendingRes] = await Promise.all([
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/bookings?status=pending', { headers: { Authorization: `Bearer ${token}` } })
        ])

        const [usersData, bookingsData, roomsData, pendingData] = await Promise.all([
          usersRes.json(),
          bookingsRes.json(),
          roomsRes.json(),
          pendingRes.json()
        ])

        // Update system stats
        setSystemStats({
          totalUsers: usersData.total || 0,
          activeBookings: bookingsData.total || 0,
          totalRooms: roomsData.total || 0,
          systemUptime: "99.8%",
          todayBookings: bookingsData.total || 0,
          pendingApprovals: pendingData.total || 0,
          securityAlerts: 0,
          maintenanceIssues: 0,
        })

        // Set pending bookings
        setPendingBookings(pendingData.bookings || [])

        // Set recent activity (last 5 bookings)
        const recentBookings = (bookingsData.bookings || []).slice(0, 5).map((booking: any) => ({
          id: booking.id,
          user: booking.userName || "Unknown User",
          action: `Booked ${booking.roomName || "Room"}`,
          time: new Date(booking.createdAt).toLocaleDateString(),
          type: "booking",
          status: booking.status,
        }))
        setRecentActivity(recentBookings)

      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleApproveBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/bookings/approve?id=${bookingId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        // Refresh the data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error approving booking:', error)
    }
  }

  const handleRejectBooking = async (bookingId: string) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'cancelled' })
      })
      if (response.ok) {
        // Refresh the data
        window.location.reload()
      }
    } catch (error) {
      console.error('Error rejecting booking:', error)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ELC Connect Admin</h1>
                <p className="text-xs text-gray-500">System Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">
                    {alerts.length}
                  </Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={admin.avatar || "/placeholder.svg"} alt={admin.name} />
                  <AvatarFallback>
                    {admin.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {admin.name}!</h1>
          <p className="text-gray-600">System overview and management dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +12% this month
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.activeBookings}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {systemStats.todayBookings} today
                  </p>
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
                  <p className="text-2xl font-bold text-gray-900">{systemStats.totalRooms}</p>
                  <p className="text-xs text-gray-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    All operational
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Uptime</p>
                  <p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Excellent
                  </p>
                </div>
                <Monitor className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Charts and Analytics */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Usage Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Room Usage Analytics</CardTitle>
                <CardDescription>Weekly booking patterns and capacity utilization</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={roomUsageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3B82F6" name="Bookings" />
                    <Bar dataKey="capacity" fill="#E5E7EB" name="Capacity" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of system users by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie
                        data={userTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {userTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {userTypeData.map((item, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                        <span className="text-sm font-medium text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/rooms">
                    <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
                      <MapPin className="w-6 h-6" />
                      <span className="text-sm">Manage Rooms</span>
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

                  <Link href="/admin/bookings">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                    >
                      <Calendar className="w-6 h-6" />
                      <span className="text-sm">View Bookings</span>
                    </Button>
                  </Link>

                  <Link href="/admin/security">
                    <Button
                      variant="outline"
                      className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                    >
                      <Shield className="w-6 h-6" />
                      <span className="text-sm">Security</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Requests awaiting review</CardDescription>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800">{systemStats.pendingApprovals}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingBookings.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No pending approvals</p>
                  ) : (
                    pendingBookings.slice(0, 3).map((booking: any) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                          <p className="font-medium text-gray-900">{booking.roomName || 'Room'}</p>
                          <p className="text-sm text-gray-600">{booking.userName || 'Unknown User'} - {booking.purpose || 'Booking'}</p>
                          <p className="text-xs text-gray-500">{booking.date} {booking.startTime} - {booking.endTime}</p>
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 h-8 px-2"
                            onClick={() => handleApproveBooking(booking.id)}
                          >
                            ✓
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 bg-transparent"
                            onClick={() => handleRejectBooking(booking.id)}
                          >
                            ✗
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {pendingBookings.length > 3 && (
                    <Link href="/admin/bookings">
                      <Button variant="outline" size="sm" className="w-full bg-transparent">
                        View All Approvals ({pendingBookings.length})
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Recent notifications and issues</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.type === "error"
                          ? "bg-red-50 border-red-200"
                          : alert.type === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {alert.type === "error" && <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />}
                        {alert.type === "warning" && <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />}
                        {alert.type === "info" && <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                          <p className="text-xs text-gray-500">{alert.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === "booking" && <Calendar className="w-4 h-4 text-blue-600" />}
                        {activity.type === "request" && <Clock className="w-4 h-4 text-yellow-600" />}
                        {activity.type === "cancellation" && <AlertTriangle className="w-4 h-4 text-red-600" />}
                        {activity.type === "security" && <Shield className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                      <Badge
                        variant={
                          activity.status === "approved" || activity.status === "completed"
                            ? "default"
                            : activity.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
