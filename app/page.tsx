"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Calendar, Shield, Users, QrCode, Monitor } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const router = useRouter()

  // Check if user is already logged in and redirect to appropriate dashboard
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      try {
        const userData = JSON.parse(user)
        // Redirect to appropriate dashboard
        router.push(userData.role === "admin" ? "/admin/dashboard" : "/dashboard")
      } catch (err) {
        // Clear invalid data
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    }
  }, [router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ELC Connect</h1>
                <p className="text-sm text-gray-600">Smart Resource Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">Educational Learning Center</Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to the <span className="text-blue-600">ELC Building</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            The Educational Learning Center is a state-of-the-art facility designed to enhance your academic experience.
            Our smart resource management system streamlines room bookings, equipment access, and collaborative
            learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                Get Started Today
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-8 bg-transparent"
            >
              Take a Virtual Tour
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Smart Features for Modern Learning</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Experience seamless resource management with our integrated digital platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Smart Room Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Reserve rooms based on capacity, equipment, and real-time availability
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Digital Repository</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Access past projects, research materials, and academic resources
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">QR Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Streamlined attendance tracking with QR code technology
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Monitor className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Screen Casting</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Remote screen sharing for seamless presentations and collaboration
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Building Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About the ELC Building</h2>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  The Educational Learning Center (ELC) is a modern, technology-enhanced facility spanning 50,000 square
                  feet across 4 floors. Designed with collaboration and innovation in mind, it houses state-of-the-art
                  classrooms, research labs, and collaborative spaces.
                </p>
                <p className="leading-relaxed">
                  Our building features advanced audio-visual equipment, high-speed internet connectivity, and flexible
                  learning environments that adapt to various teaching methodologies and group sizes.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">120+</div>
                  <div className="text-sm text-gray-600">Study Rooms</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">25</div>
                  <div className="text-sm text-gray-600">Research Labs</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">8</div>
                  <div className="text-sm text-gray-600">Lecture Halls</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Access</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="/modern-educational-building.png"
                alt="ELC Building Exterior"
                className="rounded-lg shadow-xl w-full"
              />
              <div className="absolute inset-0 bg-blue-600/10 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Access Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Shield className="w-12 h-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure & Accessible</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Role-based access control ensures security while maintaining accessibility for all authorized users
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Student Access</h3>
              <p className="text-gray-600 text-sm">Book rooms, access resources, track attendance</p>
            </div>
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Faculty Portal</h3>
              <p className="text-gray-600 text-sm">Manage classes, resources, and student access</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Admin Dashboard</h3>
              <p className="text-gray-600 text-sm">Full system control and security monitoring</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ELC Connect</span>
              </div>
              <p className="text-gray-400 mb-4">
                Streamlining resource management and enhancing collaboration in the Educational Learning Center.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About ELC
                  </Link>
                </li>
                <li>
                  <Link href="/facilities" className="hover:text-white">
                    Facilities
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="hover:text-white">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Educational Learning Center</li>
                <li>University Campus</li>
                <li>support@elc-connect.edu</li>
                <li>(555) 123-4567</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ELC Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
