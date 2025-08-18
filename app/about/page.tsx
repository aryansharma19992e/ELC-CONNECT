"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Calendar, Shield, Users, QrCode, Monitor, MapPin, Clock, Wifi, Video } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
                  <p className="text-sm text-gray-600">About ELC</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">About Us</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            About the <span className="text-blue-600">Experiential Learning Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how the ELC is revolutionizing learning through technology, collaboration, and innovative resource management.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To provide a state-of-the-art learning environment that fosters innovation, collaboration, and experiential learning. 
                We empower students and faculty with cutting-edge technology and flexible spaces designed for modern education.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-600" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                To be the leading experiential learning facility that bridges traditional education with modern technology, 
                creating an ecosystem where learning is interactive, accessible, and transformative.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Building Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Building Overview</h2>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Modern Facility</h3>
              <div className="space-y-4 text-gray-600">
                <p className="leading-relaxed">
                  The Experiential Learning Center (ELC) is a modern, technology-enhanced facility spanning 50,000 square
                  feet across 3 floors. Designed with collaboration and innovation in mind, it houses state-of-the-art
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
        </section>

        {/* Technology Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Technology & Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Wifi className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">High-Speed WiFi</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Gigabit internet connectivity throughout the building for seamless online learning
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <Video className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">AV Systems</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Advanced audio-visual equipment in all rooms for presentations and collaboration
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-lg">Smart Access</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  QR code-based attendance tracking and room access management
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
                  Wireless screen sharing capabilities for seamless presentations
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Floor Plans */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Floor Layout</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Ground Floor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Main Reception & Information Desk</li>
                  <li>• Student Lounge & Collaboration Areas</li>
                  <li>• Computer Labs (4 rooms)</li>
                  <li>• Study Rooms (20 rooms)</li>
                  <li>• Cafeteria & Break Areas</li>
                  <li>• Security Office</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  First Floor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Research Labs (15 rooms)</li>
                  <li>• Faculty Offices</li>
                  <li>• Conference Rooms (3 rooms)</li>
                  <li>• Study Rooms (40 rooms)</li>
                  <li>• Digital Repository Center</li>
                  <li>• IT Support Office</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Second Floor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Lecture Halls (8 rooms)</li>
                  <li>• Research Labs (10 rooms)</li>
                  <li>• Study Rooms (60 rooms)</li>
                  <li>• Innovation Hub</li>
                  <li>• Faculty Meeting Rooms</li>
                  <li>• Administrative Offices</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Experience ELC?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join our community of learners and discover the future of education technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/facilities">
                  <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    View Facilities
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
