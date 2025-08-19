"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Calendar, Users, MapPin, Shield, Settings, Bell, LogOut, TrendingUp, AlertTriangle, CheckCircle, Clock, Monitor } from "lucide-react"

export default function SuperAdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState({
    name: "Super Admin",
    role: "Super Administrator",
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

  const [roomUsageData, setRoomUsageData] = useState([
    { name: "Mon", bookings: 0, capacity: 80 },
    { name: "Tue", bookings: 0, capacity: 80 },
    { name: "Wed", bookings: 0, capacity: 80 },
    { name: "Thu", bookings: 0, capacity: 80 },
    { name: "Fri", bookings: 0, capacity: 80 },
    { name: "Sat", bookings: 0, capacity: 80 },
    { name: "Sun", bookings: 0, capacity: 80 },
  ])

  const [userTypeData, setUserTypeData] = useState([
    { name: "Faculty", value: 0, color: "#10B981" },
    { name: "Admins", value: 0, color: "#F59E0B" },
  ])

  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token')
      const stored = localStorage.getItem('user')
      if (!token || !stored) {
        router.push('/login')
        return
      }
      const u = JSON.parse(stored)
      const superEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL || process.env.SUPERADMIN_EMAIL
      // Only allow if flagged superadmin AND email matches env (if provided)
      if (!(u.isSuperAdmin && (!superEmail || u.email === superEmail))) {
        // Non-superadmins are redirected away
        if (u.role === 'admin') router.push('/admin/dashboard')
        else router.push('/dashboard')
        return
      }

      setAdmin({
        name: u.name || 'Super Admin',
        role: 'Super Administrator',
        email: u.email,
        avatar: "/admin-avatar.png",
      })

      try {
        const [usersRes, bookingsRes, roomsRes, pendingRes] = await Promise.all([
          fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/bookings', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/rooms', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/bookings?status=pending', { headers: { Authorization: `Bearer ${token}` } })
        ])
        const [usersData, bookingsData, roomsData, pendingData] = await Promise.all([
          usersRes.json(), bookingsRes.json(), roomsRes.json(), pendingRes.json()
        ])
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
        if (bookingsData.bookings && bookingsData.bookings.length > 0) {
          const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
          const usage = days.map(d => ({ name: d, bookings: 0, capacity: 80 }))
          bookingsData.bookings.forEach((b: any) => {
            const date = new Date(b.date)
            const idx = usage.findIndex(u => u.name === days[date.getDay()])
            if (idx >= 0) usage[idx].bookings += 1
          })
          setRoomUsageData(usage)
        }
        if (usersData.users && usersData.users.length > 0) {
          const counts = { faculty: 0, admin: 0 }
          usersData.users.forEach((x: any) => {
            if (x.role === 'faculty') counts.faculty++
            if (x.role === 'admin') counts.admin++
          })
          setUserTypeData([
            { name: "Faculty", value: counts.faculty, color: "#10B981" },
            { name: "Admins", value: counts.admin, color: "#F59E0B" },
          ])
        }
        setRecentActivity((bookingsData.bookings || []).slice(0, 5).map((b: any) => ({
          id: b.id,
          user: b.userName || 'Unknown User',
          action: `Booked ${b.roomName || 'Room'}`,
          time: new Date(b.createdAt).toLocaleDateString(),
          type: 'booking',
          status: b.status,
        })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">ELC Connect Super Admin</h1>
                <p className="text-xs text-gray-500">System Management (Full Access)</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
                {alerts.length > 0 && (
                  <Badge className="ml-1 bg-red-500 text-white text-xs px-1 py-0 min-w-[16px] h-4">{alerts.length}</Badge>
                )}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={admin.avatar} alt={admin.name} />
                  <AvatarFallback>{admin.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                  <p className="text-xs text-gray-500">{admin.role}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {admin.name}!</h1>
          <p className="text-gray-600">Full system overview and superadmin actions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Users</p><p className="text-2xl font-bold text-gray-900">{systemStats.totalUsers}</p><p className="text-xs text-green-600 flex items-center mt-1"><TrendingUp className="w-3 h-3 mr-1"/>+12% this month</p></div><Users className="w-8 h-8 text-blue-600"/></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Active Bookings</p><p className="text-2xl font-bold text-gray-900">{systemStats.activeBookings}</p><p className="text-xs text-blue-600 flex items-center mt-1"><Clock className="w-3 h-3 mr-1"/>{systemStats.todayBookings} today</p></div><Calendar className="w-8 h-8 text-green-600"/></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Rooms</p><p className="text-2xl font-bold text-gray-900">{systemStats.totalRooms}</p><p className="text-xs text-gray-600 flex items-center mt-1"><CheckCircle className="w-3 h-3 mr-1"/>All operational</p></div><MapPin className="w-8 h-8 text-purple-600"/></div></CardContent></Card>
          <Card><CardContent className="p-6"><div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">System Uptime</p><p className="text-2xl font-bold text-gray-900">{systemStats.systemUptime}</p><p className="text-xs text-green-600 flex items-center mt-1"><CheckCircle className="w-3 h-3 mr-1"/>Excellent</p></div><Monitor className="w-8 h-8 text-orange-600"/></div></CardContent></Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
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

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of system users by type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <ResponsiveContainer width="60%" height={200}>
                    <PieChart>
                      <Pie data={userTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} paddingAngle={5} dataKey="value">
                        {userTypeData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
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

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common superadmin tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/admin/rooms"><Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700"><MapPin className="w-6 h-6" /><span className="text-sm">Manage Rooms</span></Button></Link>
                  <Link href="/admin/users"><Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"><Users className="w-6 h-6" /><span className="text-sm">Manage Users</span></Button></Link>
                  <Link href="/admin/bookings"><Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"><Calendar className="w-6 h-6" /><span className="text-sm">View Bookings</span></Button></Link>
                  <Link href="/admin/security"><Button variant="outline" className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"><Shield className="w-6 h-6" /><span className="text-sm">Security</span></Button></Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Recent Activity</CardTitle><CardDescription>Latest system events</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {activity.type === "booking" && <Calendar className="w-4 h-4 text-blue-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.user} • {activity.time}</p>
                      </div>
                      <Badge variant={activity.status === 'approved' || activity.status === 'completed' ? 'default' : activity.status === 'pending' ? 'secondary' : 'outline'} className="text-xs">{activity.status}</Badge>
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


