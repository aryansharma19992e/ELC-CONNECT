"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Shield,
  Camera,
  AlertTriangle,
  Users,
  Lock,
  Eye,
  Activity,
  MapPin,
  Clock,
  Wifi,
  Server,
} from "lucide-react"
import Link from "next/link"

export default function SecurityDashboard() {
  const [securityAlerts] = useState([
    {
      id: 1,
      type: "unauthorized_access",
      location: "ELC-301",
      timestamp: "2024-01-15 14:30:22",
      severity: "high",
      description: "Unauthorized access attempt detected at Room ELC-301",
      status: "active",
    },
    {
      id: 2,
      type: "door_left_open",
      location: "ELC-205",
      timestamp: "2024-01-15 13:45:10",
      severity: "medium",
      description: "Door left open for extended period in Room ELC-205",
      status: "resolved",
    },
    {
      id: 3,
      type: "suspicious_activity",
      location: "Main Entrance",
      timestamp: "2024-01-15 12:15:33",
      severity: "low",
      description: "Unusual movement pattern detected at main entrance",
      status: "investigating",
    },
  ])

  const [cameraFeeds] = useState([
    {
      id: 1,
      name: "Main Entrance",
      location: "Ground Floor",
      status: "online",
      lastUpdate: "2 seconds ago",
      recording: true,
    },
    {
      id: 2,
      name: "ELC-301 Classroom",
      location: "3rd Floor",
      status: "online",
      lastUpdate: "1 second ago",
      recording: true,
    },
    {
      id: 3,
      name: "Library Entrance",
      location: "2nd Floor",
      status: "online",
      lastUpdate: "3 seconds ago",
      recording: true,
    },
    {
      id: 4,
      name: "Parking Area",
      location: "Outdoor",
      status: "offline",
      lastUpdate: "5 minutes ago",
      recording: false,
    },
    {
      id: 5,
      name: "Lab Complex",
      location: "1st Floor",
      status: "online",
      lastUpdate: "1 second ago",
      recording: true,
    },
    {
      id: 6,
      name: "Emergency Exit",
      location: "Ground Floor",
      status: "online",
      lastUpdate: "2 seconds ago",
      recording: true,
    },
  ])

  const [accessLogs] = useState([
    {
      id: 1,
      user: "Dr. Sarah Johnson",
      room: "ELC-301",
      action: "Entry",
      timestamp: "2024-01-15 14:25:10",
      method: "Key Card",
      status: "authorized",
    },
    {
      id: 2,
      user: "John Doe",
      room: "ELC-205",
      action: "Entry",
      timestamp: "2024-01-15 14:20:33",
      method: "Key Card",
      status: "authorized",
    },
    {
      id: 3,
      user: "Unknown User",
      room: "ELC-301",
      action: "Entry Attempt",
      timestamp: "2024-01-15 14:30:22",
      method: "Manual",
      status: "denied",
    },
    {
      id: 4,
      user: "Prof. Michael Davis",
      room: "Library",
      action: "Exit",
      timestamp: "2024-01-15 14:15:45",
      method: "Key Card",
      status: "authorized",
    },
  ])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      case "investigating":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCameraStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800"
      case "offline":
        return "bg-red-100 text-red-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessStatusColor = (status: string) => {
    switch (status) {
      case "authorized":
        return "bg-green-100 text-green-800"
      case "denied":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const securityStats = {
    totalCameras: cameraFeeds.length,
    onlineCameras: cameraFeeds.filter((c) => c.status === "online").length,
    activeAlerts: securityAlerts.filter((a) => a.status === "active").length,
    accessAttempts: accessLogs.length,
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
                <h1 className="text-lg font-semibold text-gray-900">Security Dashboard</h1>
                <p className="text-sm text-gray-500">Monitor campus security and surveillance systems</p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Cameras</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {securityStats.onlineCameras}/{securityStats.totalCameras}
                  </p>
                </div>
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{securityStats.activeAlerts}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Access Attempts</p>
                  <p className="text-2xl font-bold text-gray-900">{securityStats.accessAttempts}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">System Status</p>
                  <p className="text-2xl font-bold text-green-600">Online</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="surveillance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="surveillance">Surveillance</TabsTrigger>
            <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
            <TabsTrigger value="access">Access Control</TabsTrigger>
            <TabsTrigger value="system">System Status</TabsTrigger>
          </TabsList>

          <TabsContent value="surveillance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Live Camera Feeds</span>
                </CardTitle>
                <CardDescription>Monitor live surveillance feeds from campus security cameras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cameraFeeds.map((camera) => (
                    <Card key={camera.id} className="overflow-hidden">
                      <div className="aspect-video bg-gray-900 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-12 h-12 text-gray-600" />
                        </div>
                        <div className="absolute top-2 left-2">
                          <Badge className={getCameraStatusColor(camera.status)}>
                            {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
                          </Badge>
                        </div>
                        {camera.recording && (
                          <div className="absolute top-2 right-2">
                            <div className="flex items-center space-x-1 bg-red-600 text-white px-2 py-1 rounded text-xs">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              <span>REC</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <h3 className="font-medium text-gray-900">{camera.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-4 h-4" />
                              <span>{camera.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{camera.lastUpdate}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Eye className="w-4 h-4 mr-2" />
                              View Full
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Activity className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Security Alerts</span>
                </CardTitle>
                <CardDescription>Recent security incidents and alerts requiring attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {securityAlerts.map((alert) => (
                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge className={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                              <Badge className={getStatusColor(alert.status)}>
                                {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                              </Badge>
                            </div>
                            <h3 className="font-medium text-gray-900">{alert.description}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-4 h-4" />
                                <span>{alert.location}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{alert.timestamp}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Investigate
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Access Control Logs</span>
                </CardTitle>
                <CardDescription>Recent access attempts and entry logs for secure areas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accessLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{log.user}</p>
                          <p className="text-sm text-gray-600">
                            {log.action} • {log.room} • {log.method}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{log.timestamp}</p>
                        </div>
                        <Badge className={getAccessStatusColor(log.status)}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Server className="w-5 h-5" />
                    <span>System Health</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Server</span>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Camera Network</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Access Control</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wifi className="w-5 h-5" />
                    <span>Network Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Main Network</span>
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Network</span>
                    <Badge className="bg-green-100 text-green-800">Standby</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">VPN Tunnel</span>
                    <Badge className="bg-green-100 text-green-800">Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Firewall</span>
                    <Badge className="bg-green-100 text-green-800">Protected</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
