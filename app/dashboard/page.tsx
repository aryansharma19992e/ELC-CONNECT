"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, MapPin, Users, Plus, BookOpen, Bell, Settings, LogOut } from "lucide-react"
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
	const [quickStats, setQuickStats] = useState({
		totalBookings: 0,
		hoursThisMonth: 0,
		favoriteRoom: "-",
		upcomingToday: 0,
	})
	const [upcomingBookings, setUpcomingBookings] = useState<Array<{
		id: string | number
		room: string
		date: string
		time: string
		purpose?: string
		attendees?: number
		equipment: string[]
	}>>([])

	useEffect(() => {
		const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
		const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null
		if (!token || !stored) {
			setLoading(false)
			router.push("/login")
			return
		}

		const u = JSON.parse(stored)
		setUser({
			id: u.id,
			name: u.name || "",
			role: (u.role || "").charAt(0).toUpperCase() + (u.role || "").slice(1),
			department: u.department || "",
			email: u.email || "",
			avatar: "/student-avatar.png",
		})

		async function load() {
			try {
				const res = await fetch(`/api/bookings?userId=${encodeURIComponent(u.id || "")}&limit=5`, {
					headers: { Authorization: `Bearer ${token}` },
				})
				const json = await res.json()
				if (json?.success) {
					const list = (json.bookings || []).map((b: any) => ({
						id: b.id,
						room: b.roomName || b.roomId || "Room",
						date: b.date || "",
						time: b.startTime && b.endTime ? `${b.startTime} - ${b.endTime}` : "",
						purpose: b.purpose,
						attendees: b.attendees,
						equipment: b.equipment || [],
					}))
					setUpcomingBookings(list.slice(0, 3))
					setQuickStats((s) => ({ ...s, totalBookings: json.total || list.length }))
				}
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [router])

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

									<Link href="/dashboard/resources">
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
												<Button size="sm" variant="outline">
													Modify
												</Button>
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
									{[
										{ room: "A-203", capacity: 8, equipment: ["Projector", "WiFi"] },
										{ room: "B-101", capacity: 12, equipment: ["Computers", "WiFi"] },
										{ room: "C-305", capacity: 6, equipment: ["Whiteboard", "WiFi"] },
									].map((room, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
										>
											<div>
												<h5 className="font-medium text-gray-900">{room.room}</h5>
												<p className="text-sm text-gray-600">Capacity: {room.capacity}</p>
												<div className="flex space-x-1 mt-1">
													{room.equipment.map((eq, i) => (
														<Badge key={i} variant="outline" className="text-xs">
															{eq}
														</Badge>
													))}
												</div>
											</div>
											<Button size="sm" className="bg-green-600 hover:bg-green-700">
												Book
											</Button>
										</div>
									))}
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
									{[
										{ action: "Booked Room A-201", time: "2 hours ago", type: "booking" },
										{ action: "Attended CS-101 Lecture", time: "1 day ago", type: "attendance" },
										{ action: "Downloaded Research Paper", time: "2 days ago", type: "resource" },
									].map((activity, index) => (
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
