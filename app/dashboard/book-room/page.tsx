"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, Users, MapPin, ArrowLeft, Search, RefreshCw } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { bookingsApi } from "@/lib/api"

export default function BookRoomPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedRoom, setSelectedRoom] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [duration, setDuration] = useState("")
  const [attendees, setAttendees] = useState("")
  const [purpose, setPurpose] = useState("")
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCapacity, setFilterCapacity] = useState("")
  const [availableRooms, setAvailableRooms] = useState<any[]>([])
  const [baseRooms, setBaseRooms] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPendingApproval, setIsPendingApproval] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    async function loadRooms() {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const res = await fetch('/api/rooms', { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      const json = await res.json()
      if (json?.success) {
        const mapped = (json.rooms || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          capacity: r.capacity,
          floor: r.floor,
          type: r.type,
          equipment: r.equipment || [],
          available: r.available !== false,
          timeSlots: [] as string[],
        }))
        setBaseRooms(mapped)
        setAvailableRooms(mapped)
      }
    }
    loadRooms()
  }, [])

  // Helper to parse times like "11:00 AM" to minutes since midnight
  const parseTime = (timeStr: string): number => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!match) return -1
    let [, hours, minutes, ampm] = match
    let h = parseInt(hours)
    const m = parseInt(minutes)
    if (ampm.toLowerCase() === 'pm' && h < 12) h += 12
    if (ampm.toLowerCase() === 'am' && h === 12) h = 0
    return h * 60 + m
  }

  // Recompute room availability whenever date or timeSlot changes
  useEffect(() => {
    async function updateAvailability() {
      // If no date or no slot chosen, show base availability
      if (!selectedDate || !timeSlot || !timeSlot.includes(' - ')) {
        setAvailableRooms(baseRooms)
        return
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      try {
        console.log('Checking availability for:', dateStr, timeSlot)
        
        // Ask server to refresh completed bookings first (if it's today's date)
        const today = format(new Date(), 'yyyy-MM-dd')
        if (dateStr === today) {
          try {
            await fetch(`/api/bookings/refresh?date=${dateStr}` , { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
          } catch (e) {
            console.log('Could not refresh completed bookings:', e)
          }
        }
        
        // Fetch all bookings for the selected date (both confirmed and pending)
        const params = new URLSearchParams({ date: dateStr })
        const res = await fetch(`/api/bookings?${params}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        const json = await res.json()
        let bookings = json?.bookings || []
        
        // Filter bookings to only include confirmed and pending (exclude cancelled and completed)
        bookings = bookings.filter((b: any) => ['confirmed', 'pending'].includes(b.status))
        
        console.log('Found bookings:', bookings.length)
        console.log('All bookings for date:', bookings)
        
        const [start, end] = timeSlot.split(' - ').map(s => s.trim())
        const startMin = parseTime(start)
        const endMin = parseTime(end)
        
        const isOverlap = (bookingStart: string, bookingEnd: string) => {
          const bookingStartMin = parseTime(bookingStart)
          const bookingEndMin = parseTime(bookingEnd)
          return startMin < bookingEndMin && endMin > bookingStartMin
        }

        const updated = baseRooms.map(room => {
          const conflictingBookings = bookings.filter((b: any) => {
            const roomMatch = String(b.roomId) === String(room.id)
            const timeConflict = isOverlap(b.startTime, b.endTime)
            console.log(`Room ${room.name} (${room.id}) vs Booking ${b.roomId}:`, { roomMatch, timeConflict, bookingTime: `${b.startTime}-${b.endTime}` })
            return roomMatch && timeConflict
          })
          
          const hasConflict = conflictingBookings.length > 0
          console.log(`Room ${room.name}: ${hasConflict ? 'BOOKED' : 'AVAILABLE'}`, conflictingBookings)
          
          return { 
            ...room, 
            available: !hasConflict,
            conflictingBookings: conflictingBookings
          }
        })
        setAvailableRooms(updated)
      } catch (e) {
        console.error('Error updating availability:', e)
        // On error, fall back to base rooms
        setAvailableRooms(baseRooms)
      }
    }
    updateAvailability()
  }, [selectedDate, timeSlot, baseRooms, lastRefresh])

  // Auto-refresh availability every minute to handle slot end time
  useEffect(() => {
    if (!selectedDate || !timeSlot) return

    const interval = setInterval(() => {
      const now = new Date()
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
      const todayStr = format(now, 'yyyy-MM-dd')
      
      // If the selected date is today, check if the time slot has passed
      if (selectedDateStr === todayStr) {
        const [, endTime] = timeSlot.split(' - ').map(s => s.trim())
        const endMin = parseTime(endTime)
        const currentMin = now.getHours() * 60 + now.getMinutes()
        
        // If the time slot has ended or passed, refresh availability
        if (currentMin >= endMin) {
          console.log('Time slot has passed, refreshing availability...')
          setLastRefresh(now)
        }
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [selectedDate, timeSlot, lastRefresh])

  const equipmentOptions = [
    "Projector",
    "Whiteboard",
    "Computers",
    "WiFi",
    "Air Conditioning",
    "Video Conferencing",
    "3D Printer",
    "Microphone",
    "Recording Equipment",
  ]

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipment([...selectedEquipment, equipment])
    } else {
      setSelectedEquipment(selectedEquipment.filter((item) => item !== equipment))
    }
  }

  const handleRefreshAvailability = () => {
    setLastRefresh(new Date())
  }

  const filteredRooms = useMemo(() => availableRooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCapacity = !filterCapacity || room.capacity >= Number.parseInt(filterCapacity)
    const matchesEquipment =
      selectedEquipment.length === 0 || selectedEquipment.every((eq) => room.equipment.includes(eq))

    return matchesSearch && matchesCapacity && matchesEquipment
  }), [availableRooms, searchQuery, filterCapacity, selectedEquipment])

  const handleBookRoom = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const stored = typeof window !== 'undefined' ? localStorage.getItem('user') : null
    if (!token || !stored) {
      router.push('/login')
      return
    }
    
    // Validate required fields
    if (!selectedDate) {
      alert('Please select a date')
      return
    }
    if (!timeSlot) {
      alert('Please select a time slot')
      return
    }
    if (!selectedRoom) {
      alert('Please select a room')
      return
    }
    
    const u = JSON.parse(stored)
    const [start, end] = (timeSlot || '').split(' - ').map(s => s.trim())
    const payload = {
      userId: u.id,
      roomId: selectedRoom,
      date: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      startTime: start,
      endTime: end,
      purpose: purpose || 'General booking', // Provide default purpose
      attendees: attendees ? Number(attendees) : undefined,
      equipment: selectedEquipment,
    }
    try {
      setIsSubmitting(true)
      const json = await bookingsApi.create(payload as any)
      if (json?.success) {
        setIsPendingApproval(true)
      } else {
        console.error('Booking error:', json)
        alert(json?.error || 'Failed to create booking')
      }
    } catch (err) {
      console.error('Booking request failed:', err)
      alert('Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
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
                <h1 className="text-lg font-semibold text-gray-900">Book a Room</h1>
                <p className="text-sm text-gray-500">Reserve your space in the ELC</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
                <CardDescription>Fill in your reservation information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Time Slot</Label>
                  <Select value={timeSlot} onValueChange={setTimeSlot}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</SelectItem>
                      <SelectItem value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</SelectItem>
                      <SelectItem value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</SelectItem>
                      <SelectItem value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</SelectItem>
                      <SelectItem value="5:00 PM - 7:00 PM">5:00 PM - 7:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Number of Attendees</Label>
                  <Input
                    id="attendees"
                    type="number"
                    placeholder="How many people?"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    min="1"
                    max="50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea
                    id="purpose"
                    placeholder="Brief description of your activity"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Required Equipment</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <div key={equipment} className="flex items-center space-x-2">
                        <Checkbox
                          id={equipment}
                          checked={selectedEquipment.includes(equipment)}
                          onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                        />
                        <Label htmlFor={equipment} className="text-sm">
                          {equipment}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed"
                  onClick={handleBookRoom}
                  disabled={
                    isSubmitting ||
                    isPendingApproval ||
                    !selectedRoom || !selectedDate || !(timeSlot && timeSlot.includes(' - '))
                  }
                >
                  {isPendingApproval ? 'Waiting for approval' : isSubmitting ? 'Submitting…' : 'Book Selected Room'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Room Selection */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>Available Rooms</CardTitle>
                    <CardDescription>
                      {selectedDate && timeSlot 
                        ? `Rooms for ${timeSlot} on ${format(selectedDate, "MMM dd, yyyy")}`
                        : "Choose from available spaces"
                      }
                    </CardDescription>
                    {selectedDate && timeSlot && (
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Available</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full opacity-50"></div>
                            <span>Booked</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last updated: {format(lastRefresh, 'HH:mm:ss')}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search rooms..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-48"
                      />
                    </div>
                    <Select value={filterCapacity} onValueChange={(v) => setFilterCapacity(v === 'any' ? '' : v)}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Capacity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="5">5+ people</SelectItem>
                        <SelectItem value="10">10+ people</SelectItem>
                        <SelectItem value="20">20+ people</SelectItem>
                        <SelectItem value="50">50+ people</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedDate && timeSlot && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshAvailability}
                        className="flex items-center space-x-1"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-4 border rounded-lg transition-all relative ${
                        selectedRoom === room.id
                          ? "border-blue-500 bg-blue-50"
                          : room.available
                            ? "border-gray-200 hover:border-gray-300 cursor-pointer bg-white"
                            : "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() => room.available && setSelectedRoom(room.id)}
                    >
                      {/* Removed floating badge to avoid overlap; inline badge below shows status */}
                      <div className="flex items-start justify-between">
                        <div className={`flex-1 ${!room.available ? 'opacity-60' : ''}`}>
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`font-semibold ${room.available ? 'text-gray-900' : 'text-gray-500'}`}>
                              {room.name}
                            </h3>
                            <Badge variant={room.available ? "default" : "secondary"}>
                              {room.available ? "Available" : "Booked"}
                            </Badge>
                          </div>

                          <div className={`flex items-center space-x-4 text-sm mb-3 ${room.available ? 'text-gray-600' : 'text-gray-400'}`}>
                            <span className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {room.capacity} people
                            </span>
                            <span className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {room.floor}
                            </span>
                            <Badge variant="outline" className={!room.available ? 'opacity-60' : ''}>
                              {room.type}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {room.equipment.map((eq, index) => (
                              <Badge key={index} variant="secondary" className={`text-xs ${!room.available ? 'opacity-60' : ''}`}>
                                {eq}
                              </Badge>
                            ))}
                          </div>

                          {!room.available && selectedDate && timeSlot && room.conflictingBookings && room.conflictingBookings.length > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-600 font-medium flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Time slot conflict: {timeSlot} on {format(selectedDate, "MMM dd, yyyy")}
                              </p>
                              <p className="text-xs text-red-500 mt-1">
                                This room is already booked during your selected time period
                              </p>
                              {room.conflictingBookings.map((booking: any, index: number) => (
                                <div key={index} className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                                  <p><strong>Conflicting booking:</strong> {booking.startTime} - {booking.endTime}</p>
                                  <p><strong>Status:</strong> {booking.status}</p>
                                  {booking.purpose && <p><strong>Purpose:</strong> {booking.purpose}</p>}
                                </div>
                              ))}
                            </div>
                          )}

                          {room.available && room.timeSlots.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">Available Times:</p>
                              <div className="flex flex-wrap gap-1">
                                {room.timeSlots.map((time, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {room.available ? (
                          <Button
                            variant={selectedRoom === room.id ? "default" : "outline"}
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedRoom(room.id)
                            }}
                          >
                            {selectedRoom === room.id ? "Selected" : "Select"}
                          </Button>
                        ) : (
                          <div className="text-sm text-gray-400 font-medium">
                            Unavailable
                          </div>
                        )}
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
