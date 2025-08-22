"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, Plus, BookOpen, Bell, Settings, LogOut, CheckCircle } from "lucide-react"
import Link from "next/link"

interface DashboardUser {
	id?: string
	name: string
	role: string
	department: string
	email: string
	avatar?: string
}

export default function UserDashboard() {
	const router = useRouter()
	const [user, setUser] = useState<DashboardUser>({
		id: "",
		name: "",
		role: "",
		department: "",
		email: "",
		avatar: "/student-avatar.png",
	})
	const [loading, setLoading] = useState(true)
	const [status, setStatus] = useState<'pending' | 'active' | 'inactive' | 'suspended' | 'rejected' | ''>('')
	const [quickStats, setQuickStats] = useState({
		totalBookings: 0,
		hoursThisMonth: 0,
		favoriteRoom: "-",
		upcomingToday: 0,
	})
	const [statsLoading, setStatsLoading] = useState(true)
	const [upcomingBookings, setUpcomingBookings] = useState<Array<{
		id: string | number
		room: string
		date: string
		time: string
		purpose?: string
		attendees?: number
		equipment: string[]
		status: string
	}>>([])
	const [availableRooms, setAvailableRooms] = useState<Array<{
		id: string
		name: string
		capacity: number
		equipment: string[]
	}>>([])
	const [recentActivity, setRecentActivity] = useState<Array<{
		action: string
		time: string
		type: string
	}>>([])

	useEffect(() => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
		const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
		if (!token || !stored) {
			setLoading(false)
			router.push("/login")
			return
		}

		let u: any = null
		try {
			u = stored ? JSON.parse(stored) : null
		} catch (err) {
			// Corrupt user data in localStorage – clear and redirect to login safely
			console.error('Invalid user data in storage, clearing…', err)
			localStorage.removeItem('user')
			setLoading(false)
			router.push('/login')
			return
		}
		if (!u) {
			setLoading(false)
			router.push('/login')
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

		// Hydrate cached stats immediately to avoid empty first row
		try {
			const cached = localStorage.getItem('dashboardStats')
			if (cached) {
				const parsed = JSON.parse(cached)
				setQuickStats({
					totalBookings: parsed.totalBookings || 0,
					hoursThisMonth: parsed.hoursThisMonth || 0,
					favoriteRoom: parsed.favoriteRoom || '-',
					upcomingToday: parsed.upcomingToday || 0,
				})
			}
		} catch {}

			async function load() {
		try {
			// Refresh user status from server (in case admin approved)
			try {
				const meRes = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
				if (meRes.ok) {
					const me = await meRes.json()
					if (me?.user?.status) {
						setStatus(me.user.status)
						const updated = { ...u, status: me.user.status, role: me.user.role }
						localStorage.setItem('user', JSON.stringify(updated))
						// If user has been granted temporary admin, redirect to admin dashboard
						if (me.user.role === 'admin') {
							// small delay to let state update
							setTimeout(() => {
								window.location.href = '/admin/dashboard'
							}, 50)
							return
						}
					}
				}
			} catch {}
			// Fetch all bookings for this user to calculate stats
			let allBookingsJson: any = { bookings: [] }
			try {
				const allBookingsRes = await fetch(`/api/bookings?userId=${encodeURIComponent(u.id || "")}&limit=100`, {
					headers: { Authorization: `Bearer ${token}` },
					cache: 'no-store',
				})
				allBookingsJson = await allBookingsRes.json()
			} catch { /* keep defaults */ }
			
			// Fetch upcoming bookings for display
			let json: any = { success: true, bookings: [] }
			try {
				const res = await fetch(`/api/bookings?userId=${encodeURIComponent(u.id || "")}&limit=5`, {
					headers: { Authorization: `Bearer ${token}` },
					cache: 'no-store',
				})
				json = await res.json()
			} catch { /* keep defaults */ }
			
			// Fetch available rooms
			let roomsJson: any = { success: true, rooms: [] }
			try {
				const roomsRes = await fetch('/api/rooms', {
					headers: { Authorization: `Bearer ${token}` },
					cache: 'no-store',
				})
				roomsJson = await roomsRes.json()
			} catch { /* keep defaults */ }
			
			// Upcoming bookings list (not critical for stats)
			if (json?.success) {
				const list = (json.bookings || []).map((b: any) => ({
					id: b.id,
					room: b.roomName || b.roomId || "Room",
					date: b.date || "",
					time: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : "",
					purpose: b.purpose,
					attendees: b.attendees,
					equipment: b.equipment || [],
					status: b.status || "pending",
				}))
				setUpcomingBookings(list.slice(0, 3))
			}

			// Calculate actual stats from all bookings (independent of above call)
			const allBookings = allBookingsJson.bookings || []
			const totalBookings = allBookings.length
			
			// Calculate hours this month
			const currentMonth = new Date().getMonth()
			const currentYear = new Date().getFullYear()
			const monthlyBookings = allBookings.filter((booking: any) => {
				if (!booking.date) return false
				const bookingDate = new Date(booking.date)
				return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
			})
			
			let hoursThisMonth = 0
			monthlyBookings.forEach((booking: any) => {
				if (booking.startTime && booking.endTime) {
					// Parse time in format like "11:00 AM" or "2:30 PM"
					const parseTime = (timeStr: string): number => {
						const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
						if (!match) return 0
						let [_, hours, minutes, ampm] = match
						let h = parseInt(hours)
						const m = parseInt(minutes)
						if (ampm.toLowerCase() === 'pm' && h < 12) h += 12
						if (ampm.toLowerCase() === 'am' && h === 12) h = 0
						return h * 60 + m
					}
					
					const startMinutes = parseTime(booking.startTime)
					const endMinutes = parseTime(booking.endTime)
					const duration = (endMinutes - startMinutes) / 60 // hours
					hoursThisMonth += duration
				}
			})
			
			// Calculate favorite room
			const roomCounts: { [key: string]: number } = {}
			allBookings.forEach((booking: any) => {
				const roomName = booking.roomName || booking.roomId || "Unknown"
				roomCounts[roomName] = (roomCounts[roomName] || 0) + 1
			})
			const favoriteRoom = Object.keys(roomCounts).length > 0 
				? Object.keys(roomCounts).reduce((a, b) => roomCounts[a] > roomCounts[b] ? a : b)
				: "-"
			
			// Calculate today's bookings
			const today = new Date().toISOString().split('T')[0]
			const todaysBookings = allBookings.filter((booking: any) => booking.date === today)
			const upcomingToday = todaysBookings.length
			
			const computed = {
				totalBookings,
				hoursThisMonth: Math.round(hoursThisMonth * 10) / 10, // Round to 1 decimal
				favoriteRoom,
				upcomingToday,
			}
			setQuickStats(computed)
			try { localStorage.setItem('dashboardStats', JSON.stringify(computed)) } catch {}
			setStatsLoading(false)

			// Set available rooms regardless
			if (roomsJson?.success) {
				const rooms = (roomsJson.rooms || []).map((room: any) => ({
					id: room.id,
					name: room.name,
					capacity: room.capacity,
					equipment: room.equipment || [],
				}))
				setAvailableRooms(rooms.slice(0, 3)) // Show first 3 available rooms
			}

			// Generate recent activity from bookings
			const recentBookings = allBookings.slice(0, 3).map((booking: any) => {
				const roomName = booking.roomName || booking.roomId || "Room"
				const action = `Booked ${roomName}`
				const createdAt = new Date(booking.createdAt || booking.date)
				const now = new Date()
				const diffInHours = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60))
				
				let time = ""
				if (diffInHours < 1) {
					time = "Just now"
				} else if (diffInHours < 24) {
					time = `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
				} else {
					const diffInDays = Math.floor(diffInHours / 24)
					time = `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
				}
				
				return {
					action,
					time,
					type: "booking"
				}
			})
			setRecentActivity(recentBookings)
		} finally {
			setLoading(false)
		}
	}
		load()
	}, [router])

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'approved':
				return <Badge className="bg-green-100 text-green-800 text-xs">Approved by Admin</Badge>
			case 'pending':
				return <Badge className="bg-yellow-100 text-yellow-800 text-xs">Pending Approval</Badge>
			case 'cancelled':
				return <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>
			case 'completed':
				return <Badge className="bg-blue-100 text-blue-800 text-xs">Completed</Badge>
			default:
				return <Badge className="bg-gray-100 text-gray-800 text-xs">Unknown</Badge>
		}
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
								<p className="text-xs text-gray-500">Dashboard</p>
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
										{(user.name || "U")
											.split(" ")
											.map((n) => n[0])
											.join("")}
									</AvatarFallback>
								</Avatar>
								<div className="hidden md:block">
									<p className="text-sm font-medium text-gray-900">{user.name || "User"}</p>
									<p className="text-xs text-gray-500">{user.role || "User"}</p>
								</div>
							</div>
							<Button variant="ghost" size="sm" onClick={() => { localStorage.clear(); router.push("/login") }}>
								<LogOut className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user.name || "User"}!</h1>
					<p className="text-gray-600">
						{user.department || "-"} • {user.role || "User"}
					</p>
				</div>

				{/* Quick Stats */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">Total Bookings</p>
									<p className="text-2xl font-bold text-gray-900">{quickStats.totalBookings}</p>
								</div>
								<Calendar className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">Hours This Month</p>
									<p className="text-2xl font-bold text-gray-900">{quickStats.hoursThisMonth}</p>
								</div>
								<Clock className="w-8 h-8 text-green-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">Favorite Room</p>
									<p className="text-2xl font-bold text-gray-900">{quickStats.favoriteRoom}</p>
								</div>
								<MapPin className="w-8 h-8 text-purple-600" />
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">Today's Bookings</p>
									<p className="text-2xl font-bold text-gray-900">{quickStats.upcomingToday}</p>
								</div>
								<Users className="w-8 h-8 text-orange-600" />
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
								<CardDescription>Common tasks and shortcuts</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
									<Link href="/dashboard/book-room">
										<Button className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-blue-600 hover:bg-blue-700">
											<Plus className="w-6 h-6" />
											<span className="text-sm">Book Room</span>
										</Button>
									</Link>

									<Link href="/dashboard/my-bookings">
										<Button
											variant="outline"
											className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
										>
											<Calendar className="w-6 h-6" />
											<span className="text-sm">My Bookings</span>
										</Button>
									</Link>

									<Link href="/dashboard/repository">
										<Button
											variant="outline"
											className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
										>
											<BookOpen className="w-6 h-6" />
											<span className="text-sm">Resources</span>
										</Button>
									</Link>

									<Link href="/dashboard/attendance">
										<Button
											variant="outline"
											className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
										>
											<Users className="w-6 h-6" />
											<span className="text-sm">Attendance</span>
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>

						{/* Upcoming Bookings */}
						<Card>
							<CardHeader className="flex flex-row items-center justify-between">
								<div>
									<CardTitle>Upcoming Bookings</CardTitle>
									<CardDescription>Your scheduled room reservations</CardDescription>
								</div>
								<Link href="/dashboard/my-bookings">
									<Button variant="outline" size="sm">
										View All
									</Button>
								</Link>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{upcomingBookings.map((booking) => (
										<div
											key={booking.id}
											className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
										>
											<div className="flex items-center space-x-4">
												<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
													<MapPin className="w-6 h-6 text-blue-600" />
												</div>
												<div>
													<h4 className="font-medium text-gray-900">{booking.room}</h4>
													<p className="text-sm text-gray-600">{booking.purpose}</p>
													<div className="flex items-center space-x-4 mt-1">
														<span className="text-xs text-gray-500 flex items-center">
															<Clock className="w-3 h-3 mr-1" />
															{booking.date} • {booking.time}
														</span>
														<span className="text-xs text-gray-500 flex items-center">
															<Users className="w-3 h-3 mr-1" />
															{booking.attendees} people
														</span>
													</div>
												</div>
											</div>
											<div className="flex flex-col items-end space-y-2">
												<div className="flex space-x-1">
													{booking.equipment.map((item, index) => (
														<Badge key={index} variant="secondary" className="text-xs">
															{item}
														</Badge>
													))}
												</div>
												{booking.status === 'approved' ? (
													<Badge className="bg-green-100 text-green-800 text-xs">Approved by Admin</Badge>
												) : (
													<Button size="sm" variant="outline">
														Confirmed
													</Button>
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
						{/* Room Availability */}
						<Card>
							<CardHeader>
								<CardTitle>Available Now</CardTitle>
								<CardDescription>Rooms you can book immediately</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{availableRooms.length > 0 ? (
										availableRooms.map((room, index) => (
											<div
												key={room.id}
												className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
											>
												<div>
													<h5 className="font-medium text-gray-900">{room.name}</h5>
													<p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
													<div className="flex space-x-1 mt-1">
														{room.equipment.map((eq, i) => (
															<Badge key={i} variant="outline" className="text-xs">
																{eq}
															</Badge>
														))}
													</div>
												</div>
												<Link href="/dashboard/book-room">
													<Button size="sm" className="bg-green-600 hover:bg-green-700">
														Book
													</Button>
												</Link>
											</div>
										))
									) : (
										<div className="text-center py-4 text-gray-500">
											No rooms available at the moment
										</div>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Recent Activity */}
						<Card>
							<CardHeader>
								<CardTitle>Recent Activity</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-3">
									{recentActivity.length > 0 ? (
										recentActivity.map((activity, index) => (
											<div key={index} className="flex items-center space-x-3">
												<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
													{activity.type === "booking" && <Calendar className="w-4 h-4 text-blue-600" />}
													{activity.type === "attendance" && <Users className="w-4 h-4 text-blue-600" />}
													{activity.type === "resource" && <BookOpen className="w-4 h-4 text-blue-600" />}
												</div>
												<div className="flex-1">
													<p className="text-sm font-medium text-gray-900">{activity.action}</p>
													<p className="text-xs text-gray-500">{activity.time}</p>
												</div>
											</div>
										))
									) : (
										<div className="text-center py-4 text-gray-500">
											No recent activity
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	)
}
