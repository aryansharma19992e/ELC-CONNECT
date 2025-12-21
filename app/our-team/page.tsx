"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"

type TeamMember = {
  name: string
  roll: string
  branch: string
  photo: string
}

type Mentor = {
  name: string
  title: string
  department: string
  photo: string
}

const mentor: Mentor = {
  name: "Dr. Sharad Saxena",
  title: "ELC Coordinator",
  department: "Department of Computer Science",
  photo: "/sharad.jpeg",
}

const members: TeamMember[] = [
  { name: "Aryan Sharma", roll: "102217019", branch: "Computer Science and Engineering", photo: "/aryanNew.jpeg" },
  { name: "Abhay Bansal", roll: "102217246", branch: "Computer Science and Engineering", photo: "/abhayNew.jpeg" },
  { name: "Jagrit Goyal", roll: "102217007", branch: "Computer Science and Engineering", photo: "/jagrit.jpeg" },
  { name: "Shantanu Singh", roll: "102217248", branch: "Computer Science and Engineering", photo: "/shantanu1.jpeg" },
  { name: "Nikunj Wadhwa", roll: "102206112", branch: "Electronics and Communication", photo: "/nikunj.jpeg" },
]

export default function OurTeamPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">ELC Connect</h1>
                  <p className="text-sm text-gray-600">Our Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">Meet the Team</Badge>
          <h1 className="text-4xl font-bold text-gray-900">The People Behind ELC Connect</h1>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
            A passionate group of students building a smart resource management platform.
          </p>
        </div>

        {/* Mentor */}
        <div className="max-w-3xl mx-auto mb-12">
          <Card className="border-blue-300">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <img
                  src={mentor.photo}
                  alt={mentor.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/student-avatar.png' }}
                />
                <div>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-2">Mentor</Badge>
                  <CardTitle className="text-2xl mb-1">{mentor.name}</CardTitle>
                  <div className="text-sm text-gray-600">{mentor.title}</div>
                  <div className="text-sm text-gray-600">{mentor.department}</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((m) => (
            <Card key={m.roll} className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex items-center">
                <img
                  src={m.photo}
                  alt={m.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow -mt-12"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/student-avatar.png' }}
                />
              </CardHeader>
              <CardContent>
                <CardTitle className="text-lg mb-1">{m.name}</CardTitle>
                <div className="text-sm text-gray-600 mb-2">{m.branch}</div>
                <div className="text-xs text-gray-500">Roll No: {m.roll}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/">
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


