"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Calendar, Shield, Users, QrCode, Monitor, MapPin, Clock, Wifi, Video, Mail, Phone, MessageCircle, HelpCircle, FileText, Settings } from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const faqs = [
    {
      question: "How do I book a room?",
      answer: "Log in to your ELC Connect account, browse available rooms, select your preferred date and time, and submit your booking request. You'll receive a confirmation with a QR code for access."
    },
    {
      question: "What if I need to cancel my booking?",
      answer: "You can cancel your booking up to 2 hours before the scheduled time through your dashboard. Late cancellations may affect your booking privileges."
    },
    {
      question: "How does QR code attendance work?",
      answer: "QR codes are generated 5 minutes before your booking start time. Scan the code with your phone to mark attendance. The code is valid only during your booking time window."
    },
    {
      question: "What equipment is available in the rooms?",
      answer: "Rooms are equipped with WiFi, projectors, whiteboards, and power outlets. Specialized equipment varies by room type. Check room details when booking."
    },
    {
      question: "Can I book rooms for group study?",
      answer: "Yes! We have rooms of various capacities from 2-200 people. Select the appropriate room size when making your booking."
    },
    {
      question: "What are the building hours?",
      answer: "The ELC building is open 24/7 for authorized users. Access is controlled via QR codes and security systems."
    },
    {
      question: "How do I report technical issues?",
      answer: "Contact our IT support team via email at support@elc-connect.edu or call (555) 123-4567 during business hours."
    },
    {
      question: "Can I access the digital repository?",
      answer: "Yes, all registered users can access the digital repository through their dashboard. It contains past projects, research materials, and academic resources."
    }
  ]

  const supportChannels = [
    {
      name: "Email Support",
      description: "Get help via email with detailed responses",
      icon: Mail,
      contact: "support@elc-connect.edu",
      responseTime: "Within 24 hours",
      color: "text-blue-600"
    },
    {
      name: "Phone Support",
      description: "Speak directly with our support team",
      icon: Phone,
      contact: "(555) 123-4567",
      responseTime: "Immediate",
      color: "text-green-600"
    },
    {
      name: "Live Chat",
      description: "Real-time chat support during business hours",
      icon: MessageCircle,
      contact: "Available on dashboard",
      responseTime: "Real-time",
      color: "text-purple-600"
    },
    {
      name: "IT Support Office",
      description: "Visit our on-site support office",
      icon: Settings,
      contact: "Ground Floor, Room G-105",
      responseTime: "Walk-in",
      color: "text-orange-600"
    }
  ]

  const quickLinks = [
    {
      title: "User Guide",
      description: "Complete guide to using ELC Connect",
      icon: FileText,
      link: "#"
    },
    {
      title: "Booking Tutorial",
      description: "Step-by-step room booking guide",
      icon: Calendar,
      link: "#"
    },
    {
      title: "QR Code Help",
      description: "How to use QR codes for attendance",
      icon: QrCode,
      link: "#"
    },
    {
      title: "System Status",
      description: "Check if our systems are running smoothly",
      icon: Monitor,
      link: "#"
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
                  <p className="text-sm text-gray-600">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">Support Center</Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            How Can We <span className="text-blue-600">Help You?</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get the support you need to make the most of the Experiential Learning Center. We're here to help with any questions or issues.
          </p>
        </div>

        {/* Support Channels */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Support</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <channel.icon className={`w-12 h-12 mx-auto mb-4 ${channel.color}`} />
                  <CardTitle className="text-lg">{channel.name}</CardTitle>
                  <CardDescription>{channel.description}</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="font-medium text-gray-900 mb-2">{channel.contact}</p>
                  <Badge variant="outline" className="text-xs">
                    {channel.responseTime}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Quick Help</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Card key={index} className="border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <link.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{link.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid lg:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <HelpCircle className="w-5 h-5 text-blue-600" />
                    {faq.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Business Hours */}
        <section className="mb-16">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Business Hours & Support Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Building Access</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>24/7 Access:</strong> Available for authorized users</li>
                    <li>• <strong>Security Office:</strong> Ground Floor, Room G-105</li>
                    <li>• <strong>Emergency Contact:</strong> (555) 123-4567</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Support Hours</h4>
                  <ul className="space-y-2 text-gray-600">
                    <li>• <strong>Email Support:</strong> 24/7 (response within 24 hours)</li>
                    <li>• <strong>Phone Support:</strong> Mon-Fri 8:00 AM - 6:00 PM</li>
                    <li>• <strong>Live Chat:</strong> Mon-Fri 9:00 AM - 5:00 PM</li>
                    <li>• <strong>IT Office:</strong> Mon-Fri 8:00 AM - 6:00 PM</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Emergency Information */}
        <section className="mb-16">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Shield className="w-6 h-6 text-red-600" />
                Emergency Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-red-800 mb-3">Emergency Contacts</h4>
                  <ul className="space-y-2 text-red-700">
                    <li>• <strong>Security:</strong> (555) 123-4567</li>
                    <li>• <strong>IT Emergency:</strong> (555) 123-4568</li>
                    <li>• <strong>Building Maintenance:</strong> (555) 123-4569</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-3">Emergency Procedures</h4>
                  <ul className="space-y-2 text-red-700">
                    <li>• Follow evacuation signs in case of emergency</li>
                    <li>• Contact security immediately for any issues</li>
                    <li>• Report technical emergencies to IT support</li>
                    <li>• Building access may be restricted during emergencies</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Form */}
        <section className="mb-16">
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-6 h-6 text-blue-600" />
                Send Us a Message
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a detailed message and we'll get back to you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select a topic</option>
                    <option>Booking Issues</option>
                    <option>Technical Problems</option>
                    <option>QR Code Problems</option>
                    <option>Account Issues</option>
                    <option>General Inquiry</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe your issue or question in detail..."
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Send Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Our support team is here to help you make the most of the ELC experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Contact Support
                </Button>
                <Link href="/about">
                  <Button size="lg" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                    Learn More About ELC
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
