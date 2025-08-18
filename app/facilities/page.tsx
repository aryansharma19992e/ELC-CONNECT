"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Calendar, Shield, Users, QrCode, Monitor, MapPin, Clock, Wifi, Video, Building, Computer, Microscope, Presentation } from "lucide-react"
import Link from "next/link"

export default function FacilitiesPage() {
  const roomTypes = [
    {
      type: "Study Rooms",
      count: 120,
      icon: BookOpen,
      description: "Individual and group study spaces with flexible seating arrangements",
      features: ["Flexible seating", "Whiteboards", "WiFi", "Power outlets", "Natural lighting"],
      capacity: "2-8 people"
    },
    {
      type: "Research Labs",
      count: 25,
      icon: Microscope,
      description: "Specialized laboratories for research and experimental work",
      features: ["Specialized equipment", "Safety protocols", "Data stations", "Storage facilities", "Ventilation systems"],
      capacity: "4-12 people"
    },
    {
      type: "Lecture Halls",
      count: 8,
      icon: Presentation,
      description: "Large auditorium-style rooms for lectures and presentations",
      features: ["Projection systems", "Audio systems", "Podium", "Fixed seating", "Recording capabilities"],
      capacity: "50-200 people"
    },
    {
      type: "Computer Labs",
      count: 4,
      icon: Computer,
      description: "Technology-equipped rooms with computers and software",
      features: ["High-end computers", "Specialized software", "Printing facilities", "Technical support", "Network access"],
      capacity: "20-30 people"
    },
    {
      type: "Conference Rooms",
      count: 3,
      icon: Users,
      description: "Professional meeting spaces for discussions and presentations",
      features: ["Video conferencing", "Presentation equipment", "Meeting tables", "Audio systems", "Privacy"],
      capacity: "10-25 people"
    },
    {
      type: "Innovation Hub",
      count: 1,
      icon: Building,
      description: "Collaborative space for creative projects and innovation",
      features: ["3D printers", "Prototyping tools", "Collaboration spaces", "Mentoring areas", "Project displays"],
      capacity: "15-30 people"
    }
  ]

  const amenities = [
    {
      name: "High-Speed WiFi",
      description: "Gigabit internet connectivity throughout the building",
      icon: Wifi
    },
    {
      name: "Audio-Visual Systems",
      description: "Advanced AV equipment in all presentation spaces",
      icon: Video
    },
    {
      name: "24/7 Access",
      description: "Round-the-clock access for authorized users",
      icon: Clock
    },
    {
      name: "Security System",
      description: "Comprehensive security with QR code access control",
      icon: Shield
    },
    {
      name: "Digital Repository",
      description: "Access to digital resources and past projects",
      icon: BookOpen
    },
    {
      name: "Screen Casting",
      description: "Wireless screen sharing capabilities",
      icon: Monitor
    }
  ]

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
                  <p className="text-sm text-gray-600">Facilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">Our Facilities</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Explore Our <span className="text-blue-600">Facilities</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of learning spaces, from intimate study rooms to state-of-the-art research laboratories.
          </p>
        </div>

        {/* Room Types */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Room Types & Capacities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roomTypes.map((room, index) => (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <room.icon className="w-8 h-8 text-blue-600" />
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {room.count} {room.count === 1 ? 'room' : 'rooms'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{room.type}</CardTitle>
                  <CardDescription>{room.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {room.capacity}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                      <ul className="space-y-1">
                        {room.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="text-xs text-gray-600 flex items-center gap-1">
                            <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Building Amenities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {amenities.map((amenity, index) => (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <amenity.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{amenity.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {amenity.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Floor Overview */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Floor-by-Floor Overview</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Ground Floor
                </CardTitle>
                <CardDescription>Main entrance and student services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Study Rooms</span>
                    <Badge variant="outline">20</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Computer Labs</span>
                    <Badge variant="outline">4</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Student Lounge</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cafeteria</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  First Floor
                </CardTitle>
                <CardDescription>Research and collaboration spaces</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Study Rooms</span>
                    <Badge variant="outline">40</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Research Labs</span>
                    <Badge variant="outline">15</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conference Rooms</span>
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Faculty Offices</span>
                    <Badge variant="outline">25</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Second Floor
                </CardTitle>
                <CardDescription>Large spaces and innovation hub</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Study Rooms</span>
                    <Badge variant="outline">60</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Lecture Halls</span>
                    <Badge variant="outline">8</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Research Labs</span>
                    <Badge variant="outline">10</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Innovation Hub</span>
                    <Badge variant="outline">1</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Booking Information */}
        <section className="mb-16">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">How to Book</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Create an account or log in to ELC Connect</li>
                    <li>• Browse available rooms by type, capacity, or equipment</li>
                    <li>• Select your preferred date and time slot</li>
                    <li>• Submit your booking request</li>
                    <li>• Receive confirmation and QR code for access</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Booking Policies</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Rooms can be booked up to 2 weeks in advance</li>
                    <li>• Maximum booking duration: 4 hours per session</li>
                    <li>• Cancellation allowed up to 2 hours before booking</li>
                    <li>• No-show policy: 3 strikes result in booking restrictions</li>
                    <li>• Equipment must be returned in good condition</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Book a Room?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Start exploring our facilities and book your perfect learning space today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started Today
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    Login to Book
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
