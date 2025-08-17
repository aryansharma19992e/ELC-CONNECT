"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, QrCode, Scan, Clock, Users, CheckCircle, XCircle, Calendar } from "lucide-react"
import Link from "next/link"

export default function AttendancePage() {
  const [attendanceRecords] = useState([
    {
      id: 1,
      courseName: "Advanced Machine Learning",
      courseCode: "CS-501",
      date: "2024-01-15",
      time: "10:00 AM",
      room: "ELC-301",
      instructor: "Dr. Sarah Johnson",
      status: "present",
      checkInTime: "10:02 AM",
      qrScanned: true,
    },
    {
      id: 2,
      courseName: "Database Systems",
      courseCode: "CS-401",
      date: "2024-01-14",
      time: "2:00 PM",
      room: "ELC-205",
      instructor: "Prof. Michael Davis",
      status: "present",
      checkInTime: "1:58 PM",
      qrScanned: true,
    },
    {
      id: 3,
      courseName: "Software Engineering",
      courseCode: "CS-402",
      date: "2024-01-13",
      time: "9:00 AM",
      room: "ELC-101",
      instructor: "Dr. Lisa Wang",
      status: "absent",
      checkInTime: null,
      qrScanned: false,
    },
    {
      id: 4,
      courseName: "Computer Networks",
      courseCode: "CS-403",
      date: "2024-01-12",
      time: "11:00 AM",
      room: "ELC-202",
      instructor: "Prof. John Martinez",
      status: "late",
      checkInTime: "11:15 AM",
      qrScanned: true,
    },
  ])

  const [currentQR, setCurrentQR] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCourse, setFilterCourse] = useState("all")

  // Generate QR code for current session
  useEffect(() => {
    const generateQR = () => {
      const timestamp = Date.now()
      const sessionId = `ELC-${timestamp}`
      setCurrentQR(sessionId)
    }
    generateQR()
  }, [])

  const filteredRecords = attendanceRecords.filter((record) => {
    const matchesStatus = filterStatus === "all" || record.status === filterStatus
    const matchesCourse = filterCourse === "all" || record.courseCode === filterCourse
    return matchesStatus && matchesCourse
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800"
      case "absent":
        return "bg-red-100 text-red-800"
      case "late":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "absent":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "late":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const handleQRScan = () => {
    setIsScanning(true)
    // Simulate QR scanning process
    setTimeout(() => {
      setIsScanning(false)
      alert("Attendance marked successfully!")
    }, 2000)
  }

  const attendanceStats = {
    totalClasses: attendanceRecords.length,
    present: attendanceRecords.filter((r) => r.status === "present").length,
    absent: attendanceRecords.filter((r) => r.status === "absent").length,
    late: attendanceRecords.filter((r) => r.status === "late").length,
  }

  const attendanceRate = ((attendanceStats.present + attendanceStats.late) / attendanceStats.totalClasses) * 100

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
                <h1 className="text-lg font-semibold text-gray-900">QR Attendance</h1>
                <p className="text-sm text-gray-500">Track your class attendance with QR codes</p>
              </div>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleQRScan} disabled={isScanning}>
              <Scan className="w-4 h-4 mr-2" />
              {isScanning ? "Scanning..." : "Scan QR Code"}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Attendance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceRate.toFixed(1)}%</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.totalClasses}</p>
                </div>
                <Calendar className="w-8 h-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.present}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.late}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-gray-900">{attendanceStats.absent}</p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code Scanner */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Current Session</span>
                </CardTitle>
                <CardDescription>Scan the QR code displayed in your classroom to mark attendance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-100 rounded-lg p-8 text-center">
                  <div className="w-32 h-32 mx-auto bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
                    <QrCode className="w-16 h-16 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Session ID:</p>
                  <p className="font-mono text-xs bg-white px-2 py-1 rounded border">{currentQR}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Manual QR Code Entry</label>
                    <Input placeholder="Enter QR code manually" />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleQRScan}>
                    <Scan className="w-4 h-4 mr-2" />
                    Mark Attendance
                  </Button>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• QR codes are displayed in each classroom</li>
                    <li>• Scan during the first 15 minutes of class</li>
                    <li>• Late arrivals are automatically marked</li>
                    <li>• Attendance is recorded instantly</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Attendance History</CardTitle>
                    <CardDescription>Your recent class attendance records</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="present">Present</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                        <SelectItem value="late">Late</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        <SelectItem value="CS-501">CS-501</SelectItem>
                        <SelectItem value="CS-401">CS-401</SelectItem>
                        <SelectItem value="CS-402">CS-402</SelectItem>
                        <SelectItem value="CS-403">CS-403</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Check-in</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">{record.courseName}</p>
                            <p className="text-sm text-gray-500">{record.courseCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium">{record.date}</p>
                            <p className="text-sm text-gray-500">{record.time}</p>
                          </div>
                        </TableCell>
                        <TableCell>{record.room}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(record.status)}
                            <Badge className={getStatusColor(record.status)}>
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{record.checkInTime || "—"}</TableCell>
                        <TableCell>
                          {record.qrScanned ? (
                            <div className="flex items-center space-x-1 text-green-600">
                              <QrCode className="w-4 h-4" />
                              <span className="text-sm">QR Code</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
