"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Cast, Monitor, Smartphone, Laptop, Play, Square, Volume2, Settings, Wifi } from "lucide-react"
import Link from "next/link"

export default function ScreenCastPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [isCasting, setIsCasting] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState("")
  const [castingDevice, setCastingDevice] = useState("laptop")

  const [availableRooms] = useState([
    {
      id: "elc-301",
      name: "ELC-301",
      type: "Smart Classroom",
      capacity: 50,
      equipment: ["4K Display", "Wireless Casting", "Audio System"],
      status: "available",
      currentUsers: 0,
    },
    {
      id: "elc-205",
      name: "ELC-205",
      type: "Lecture Hall",
      capacity: 100,
      equipment: ["Projector", "Wireless Casting", "Microphone"],
      status: "occupied",
      currentUsers: 3,
    },
    {
      id: "elc-101",
      name: "ELC-101",
      type: "Conference Room",
      capacity: 20,
      equipment: ["Smart TV", "Wireless Casting", "Video Conference"],
      status: "available",
      currentUsers: 0,
    },
    {
      id: "elc-lab-1",
      name: "Computer Lab 1",
      type: "Computer Lab",
      capacity: 30,
      equipment: ["Multiple Displays", "Wireless Casting", "Lab Computers"],
      status: "maintenance",
      currentUsers: 0,
    },
  ])

  const [castingSessions] = useState([
    {
      id: 1,
      user: "Dr. Sarah Johnson",
      room: "ELC-301",
      device: "Laptop",
      startTime: "10:00 AM",
      duration: "45 minutes",
      status: "active",
      viewers: 25,
    },
    {
      id: 2,
      user: "Prof. Michael Davis",
      room: "ELC-205",
      device: "Tablet",
      startTime: "2:00 PM",
      duration: "30 minutes",
      status: "active",
      viewers: 18,
    },
    {
      id: 3,
      user: "John Doe",
      room: "ELC-101",
      device: "Smartphone",
      startTime: "Yesterday 3:30 PM",
      duration: "20 minutes",
      status: "completed",
      viewers: 8,
    },
  ])

  const handleConnect = () => {
    if (selectedRoom) {
      setIsConnected(true)
      alert(`Connected to ${selectedRoom}`)
    } else {
      alert("Please select a room first")
    }
  }

  const handleStartCasting = () => {
    if (isConnected) {
      setIsCasting(true)
      alert("Screen casting started!")
    }
  }

  const handleStopCasting = () => {
    setIsCasting(false)
    alert("Screen casting stopped!")
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setIsCasting(false)
    setSelectedRoom("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "occupied":
        return "bg-yellow-100 text-yellow-800"
      case "maintenance":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "laptop":
        return <Laptop className="w-4 h-4" />
      case "smartphone":
        return <Smartphone className="w-4 h-4" />
      case "tablet":
        return <Monitor className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
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
                <h1 className="text-lg font-semibold text-gray-900">Screen Casting</h1>
                <p className="text-sm text-gray-500">Cast your screen to classroom displays wirelessly</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isConnected && (
                <Badge className="bg-green-100 text-green-800">
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
              {isCasting && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Cast className="w-3 h-3 mr-1" />
                  Casting
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="cast" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cast">Cast Screen</TabsTrigger>
            <TabsTrigger value="rooms">Available Rooms</TabsTrigger>
            <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          </TabsList>

          <TabsContent value="cast" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Casting Control */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Cast className="w-5 h-5" />
                    <span>Screen Casting Control</span>
                  </CardTitle>
                  <CardDescription>Connect to a classroom display and start casting your screen</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Room</label>
                      <Select value={selectedRoom} onValueChange={setSelectedRoom}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a classroom" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms
                            .filter((room) => room.status === "available")
                            .map((room) => (
                              <SelectItem key={room.id} value={room.id}>
                                {room.name} - {room.type}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Casting Device</label>
                      <Select value={castingDevice} onValueChange={setCastingDevice}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="laptop">Laptop</SelectItem>
                          <SelectItem value="smartphone">Smartphone</SelectItem>
                          <SelectItem value="tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    {!isConnected ? (
                      <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleConnect}>
                        <Wifi className="w-4 h-4 mr-2" />
                        Connect to Room
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex space-x-3">
                          {!isCasting ? (
                            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleStartCasting}>
                              <Play className="w-4 h-4 mr-2" />
                              Start Casting
                            </Button>
                          ) : (
                            <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={handleStopCasting}>
                              <Square className="w-4 h-4 mr-2" />
                              Stop Casting
                            </Button>
                          )}
                          <Button variant="outline" className="bg-transparent">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                        <Button variant="outline" className="w-full bg-transparent" onClick={handleDisconnect}>
                          Disconnect
                        </Button>
                      </div>
                    )}
                  </div>

                  {isConnected && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Connection Details:</h4>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• Room: {availableRooms.find((r) => r.id === selectedRoom)?.name}</p>
                        <p>• Device: {castingDevice}</p>
                        <p>• Quality: 1080p HD</p>
                        <p>• Latency: Low (~50ms)</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Preview & Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Monitor className="w-5 h-5" />
                    <span>Screen Preview</span>
                  </CardTitle>
                  <CardDescription>Preview what will be displayed on the classroom screen</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {isCasting ? (
                        <div className="text-center text-white">
                          <Cast className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-lg font-medium">Casting Active</p>
                          <p className="text-sm opacity-75">Your screen is being displayed</p>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Monitor className="w-12 h-12 mx-auto mb-2" />
                          <p className="text-lg font-medium">No Active Cast</p>
                          <p className="text-sm">Connect to a room to start casting</p>
                        </div>
                      )}
                    </div>
                    {isCasting && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded text-xs">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span>LIVE</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Audio</span>
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-gray-600" />
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Quality</span>
                      <Badge className="bg-blue-100 text-blue-800">1080p HD</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Frame Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">30 FPS</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rooms" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Available Rooms</CardTitle>
                <CardDescription>Classrooms equipped with wireless casting capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {availableRooms.map((room) => (
                    <Card key={room.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{room.name}</CardTitle>
                            <CardDescription>{room.type}</CardDescription>
                          </div>
                          <Badge className={getStatusColor(room.status)}>
                            {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Capacity:</span>
                          <span className="font-medium">{room.capacity} people</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Current Users:</span>
                          <span className="font-medium">{room.currentUsers}</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Equipment:</p>
                          <div className="flex flex-wrap gap-1">
                            {room.equipment.map((item) => (
                              <Badge key={item} variant="outline" className="text-xs">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          disabled={room.status !== "available"}
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <Cast className="w-4 h-4 mr-2" />
                          {room.status === "available" ? "Select Room" : "Unavailable"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Casting Sessions</CardTitle>
                <CardDescription>Current and recent screen casting activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {castingSessions.map((session) => (
                    <Card key={session.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              {getDeviceIcon(session.device)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{session.user}</h3>
                              <p className="text-sm text-gray-600">
                                {session.room} • {session.device} • {session.startTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">{session.duration}</p>
                              <p className="text-xs text-gray-600">{session.viewers} viewers</p>
                            </div>
                            <Badge
                              className={
                                session.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }
                            >
                              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
