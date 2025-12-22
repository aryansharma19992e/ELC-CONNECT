"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MapPin, Plus, Edit, Trash2, ArrowLeft, Search, Users } from "lucide-react"
import Link from "next/link"

const formatRoomType = (raw?: string) => {
  switch ((raw || "").toLowerCase()) {
    case "computer_lab":
    case "computer lab":
      return "Computer Lab"
    case "conference_room":
    case "conference room":
      return "Conference Room"
    case "study_room":
    case "study room":
      return "Study Room"
    case "classroom":
      return "Classroom"
    case "meeting_room":
    case "meeting room":
      return "Meeting Room"
    case "lecture_hall":
    case "lecture hall":
      return "Lecture Hall"
    case "research_lab":
    case "research lab":
      return "Research Lab"
    default:
      return raw || "Other"
  }
}

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("All Types")
  const [filterStatus, setFilterStatus] = useState("All Status")
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: "",
    capacity: "",
    floor: "",
    building: "",
    type: "",
    equipment: [] as string[],
    description: "",
  })

  useEffect(() => {
    async function loadRooms() {
      try {
        const res = await fetch('/api/rooms', { cache: 'no-store' })
        if (res.ok) {
          const json = await res.json()
          const mapped = (json.rooms || []).map((r: any) => ({
            id: r.id,
            name: r.name,
            capacity: r.capacity,
            floor: r.floor || "",
            building: r.building || "",
            type: formatRoomType(r.type),
            equipment: r.equipment || [],
            status: r.available === false ? "maintenance" : "available",
            bookingsToday: 0,
            utilizationRate: 0,
            maintenanceDate: "",
          }))
          setRooms(mapped)
        } else {
          setRooms([])
        }
      } catch {
        setRooms([])
      } finally {
        setLoading(false)
      }
    }
    loadRooms()
  }, [])

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
    "Smart Board",
  ]

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.building.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType =
      filterType === "All Types" ||
      room.type.toLowerCase() === filterType.toLowerCase()
    const matchesStatus =
      filterStatus === "All Status" ||
      room.status.toLowerCase() === filterStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const handleEquipmentChange = (equipment: string, checked: boolean) => {
    if (checked) {
      setNewRoom((prev) => ({ ...prev, equipment: [...prev.equipment, equipment] }))
    } else {
      setNewRoom((prev) => ({ ...prev, equipment: prev.equipment.filter((item) => item !== equipment) }))
    }
  }

  const handleAddRoom = () => {
    const roomData = {
      id: `${newRoom.building.charAt(0)}-${Math.floor(Math.random() * 900) + 100}`,
      name: newRoom.name,
      capacity: Number.parseInt(newRoom.capacity),
      floor: newRoom.floor,
      building: newRoom.building,
      type: newRoom.type,
      equipment: newRoom.equipment,
      status: "available" as const,
      bookingsToday: 0,
      utilizationRate: 0,
      maintenanceDate: new Date().toISOString().split("T")[0],
    }

    setRooms([...rooms, roomData])
    setIsAddRoomOpen(false)
    setNewRoom({
      name: "",
      capacity: "",
      floor: "",
      building: "",
      type: "",
      equipment: [],
      description: "",
    })
  }

  const handleDeleteRoom = (roomId: string) => {
    if (confirm("Are you sure you want to delete this room?")) {
      setRooms(rooms.filter((room) => room.id !== roomId))
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-blue-100 text-blue-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Room Management</h1>
                <p className="text-sm text-gray-500">Manage ELC rooms and facilities</p>
              </div>
            </div>

            <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Room
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Room</DialogTitle>
                  <DialogDescription>Create a new room in the ELC system</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="roomName">Room Name</Label>
                      <Input
                        id="roomName"
                        placeholder="e.g., Room A-201"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        placeholder="Number of people"
                        value={newRoom.capacity}
                        onChange={(e) => setNewRoom({ ...newRoom, capacity: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="building">Building</Label>
                      <Select
                        value={newRoom.building}
                        onValueChange={(value) => setNewRoom({ ...newRoom, building: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select building" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Building A">Building A</SelectItem>
                          <SelectItem value="Building B">Building B</SelectItem>
                          <SelectItem value="Building C">Building C</SelectItem>
                          <SelectItem value="Building D">Building D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="floor">Floor</Label>
                      <Select value={newRoom.floor} onValueChange={(value) => setNewRoom({ ...newRoom, floor: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select floor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Ground Floor">Ground Floor</SelectItem>
                          <SelectItem value="1st Floor">1st Floor</SelectItem>
                          <SelectItem value="2nd Floor">2nd Floor</SelectItem>
                          <SelectItem value="3rd Floor">3rd Floor</SelectItem>
                          <SelectItem value="4th Floor">4th Floor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Room Type</Label>
                      <Select value={newRoom.type} onValueChange={(value) => setNewRoom({ ...newRoom, type: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Study Room">Study Room</SelectItem>
                          <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                          <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                          <SelectItem value="Lecture Hall">Lecture Hall</SelectItem>
                          <SelectItem value="Research Lab">Research Lab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Equipment</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {equipmentOptions.map((equipment) => (
                        <div key={equipment} className="flex items-center space-x-2">
                          <Checkbox
                            id={equipment}
                            checked={newRoom.equipment.includes(equipment)}
                            onCheckedChange={(checked) => handleEquipmentChange(equipment, checked as boolean)}
                          />
                          <Label htmlFor={equipment} className="text-sm">
                            {equipment}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Additional room details..."
                      value={newRoom.description}
                      onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddRoomOpen(false)} className="bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoom} className="bg-blue-600 hover:bg-blue-700">
                    Add Room
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search rooms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Room Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Types">All Types</SelectItem>
                    <SelectItem value="Study Room">Study Room</SelectItem>
                    <SelectItem value="Computer Lab">Computer Lab</SelectItem>
                    <SelectItem value="Meeting Room">Meeting Room</SelectItem>
                    <SelectItem value="Lecture Hall">Lecture Hall</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Status">All Status</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Total Rooms: {filteredRooms.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rooms Table */}
        <Card>
          <CardHeader>
            <CardTitle>Room Overview</CardTitle>
            <CardDescription>Manage all rooms and their configurations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Today's Bookings</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-sm text-gray-500">
                      Loading rooms...
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredRooms.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-sm text-gray-500">
                      No rooms found.
                    </TableCell>
                  </TableRow>
                )}
                {!loading && filteredRooms.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{room.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {room.equipment.slice(0, 2).map((eq, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                          {room.equipment.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{room.equipment.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{room.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {room.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <div>
                          <p className="text-sm">{room.building}</p>
                          <p className="text-xs text-gray-500">{room.floor}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(room.status)}>
                        {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{room.bookingsToday}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${room.utilizationRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{room.utilizationRate}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDeleteRoom(room.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
