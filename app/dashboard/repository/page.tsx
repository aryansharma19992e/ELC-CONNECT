"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  BookOpen,
  FileText,
  Beaker,
  Calculator,
  Cpu,
  Heart,
  Globe,
  Star,
  Calendar,
  User,
} from "lucide-react"
import Link from "next/link"

export default function RepositoryPage() {
  const [resources] = useState([
    {
      id: 1,
      title: "Machine Learning Algorithms Implementation",
      description:
        "Comprehensive implementation of various ML algorithms including neural networks, decision trees, and clustering methods.",
      author: "Dr. Sarah Johnson",
      department: "Computer Science",
      category: "research",
      type: "pdf",
      size: "2.4 MB",
      downloads: 156,
      rating: 4.8,
      uploadDate: "2024-01-15",
      tags: ["machine-learning", "algorithms", "python", "neural-networks"],
      featured: true,
    },
    {
      id: 2,
      title: "Sustainable Energy Systems Project",
      description: "Final year project on renewable energy integration and smart grid technologies.",
      author: "Alex Chen",
      department: "Engineering",
      category: "project",
      type: "zip",
      size: "15.7 MB",
      downloads: 89,
      rating: 4.6,
      uploadDate: "2024-01-10",
      tags: ["renewable-energy", "smart-grid", "sustainability", "engineering"],
      featured: false,
    },
    {
      id: 3,
      title: "Advanced Calculus Study Guide",
      description:
        "Comprehensive study materials covering multivariable calculus, differential equations, and vector analysis.",
      author: "Prof. Michael Davis",
      department: "Mathematics",
      category: "study-material",
      type: "pdf",
      size: "5.2 MB",
      downloads: 234,
      rating: 4.9,
      uploadDate: "2024-01-08",
      tags: ["calculus", "mathematics", "differential-equations", "study-guide"],
      featured: true,
    },
    {
      id: 4,
      title: "Quantum Computing Research Paper",
      description: "Latest research on quantum algorithms and their applications in cryptography and optimization.",
      author: "Dr. Lisa Wang",
      department: "Physics",
      category: "research",
      type: "pdf",
      size: "1.8 MB",
      downloads: 67,
      rating: 4.7,
      uploadDate: "2024-01-05",
      tags: ["quantum-computing", "cryptography", "algorithms", "physics"],
      featured: false,
    },
    {
      id: 5,
      title: "Web Development Bootcamp Materials",
      description:
        "Complete course materials for full-stack web development including React, Node.js, and database design.",
      author: "John Martinez",
      department: "Computer Science",
      category: "course-material",
      type: "zip",
      size: "45.3 MB",
      downloads: 312,
      rating: 4.5,
      uploadDate: "2023-12-20",
      tags: ["web-development", "react", "nodejs", "full-stack"],
      featured: true,
    },
    {
      id: 6,
      title: "Biomedical Engineering Lab Reports",
      description: "Collection of lab reports covering medical device design, biomaterials, and tissue engineering.",
      author: "Dr. Emily Rodriguez",
      department: "Biomedical Engineering",
      category: "lab-report",
      type: "pdf",
      size: "8.9 MB",
      downloads: 78,
      rating: 4.4,
      uploadDate: "2023-12-15",
      tags: ["biomedical", "lab-reports", "medical-devices", "tissue-engineering"],
      featured: false,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [sortBy, setSortBy] = useState("recent")

  const filteredResources = resources
    .filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = filterCategory === "all" || resource.category === filterCategory
      const matchesDepartment = filterDepartment === "all" || resource.department === filterDepartment

      return matchesSearch && matchesCategory && matchesDepartment
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return b.downloads - a.downloads
        case "rating":
          return b.rating - a.rating
        case "recent":
        default:
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
      }
    })

  const featuredResources = resources.filter((resource) => resource.featured)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "research":
        return <Beaker className="w-4 h-4" />
      case "project":
        return <Cpu className="w-4 h-4" />
      case "study-material":
        return <BookOpen className="w-4 h-4" />
      case "course-material":
        return <FileText className="w-4 h-4" />
      case "lab-report":
        return <Calculator className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "research":
        return "bg-purple-100 text-purple-800"
      case "project":
        return "bg-blue-100 text-blue-800"
      case "study-material":
        return "bg-green-100 text-green-800"
      case "course-material":
        return "bg-orange-100 text-orange-800"
      case "lab-report":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "Computer Science":
        return <Cpu className="w-4 h-4" />
      case "Engineering":
        return <Cpu className="w-4 h-4" />
      case "Mathematics":
        return <Calculator className="w-4 h-4" />
      case "Physics":
        return <Globe className="w-4 h-4" />
      case "Biomedical Engineering":
        return <Heart className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const handleDownload = (resourceId: number) => {
    // Handle download logic
    alert(`Downloading resource ${resourceId}...`)
  }

  const handlePreview = (resourceId: number) => {
    // Handle preview logic
    alert(`Opening preview for resource ${resourceId}...`)
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
                <h1 className="text-lg font-semibold text-gray-900">Digital Repository</h1>
                <p className="text-sm text-gray-500">Access academic resources and research materials</p>
              </div>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <BookOpen className="w-4 h-4 mr-2" />
              Upload Resource
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="featured">Featured Content</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="flex space-x-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="research">Research</SelectItem>
                        <SelectItem value="project">Projects</SelectItem>
                        <SelectItem value="study-material">Study Materials</SelectItem>
                        <SelectItem value="course-material">Course Materials</SelectItem>
                        <SelectItem value="lab-report">Lab Reports</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Engineering">Engineering</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Biomedical Engineering">Biomedical Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>Found: {filteredResources.length} resources</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resources Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={getCategoryColor(resource.category)}>
                        <span className="flex items-center space-x-1">
                          {getCategoryIcon(resource.category)}
                          <span>{resource.category.replace("-", " ")}</span>
                        </span>
                      </Badge>
                      {resource.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>
                    <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                    <CardDescription className="text-sm line-clamp-2">{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{resource.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDepartmentIcon(resource.department)}
                        <span>{resource.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{resource.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{resource.size}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handlePreview(resource.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleDownload(resource.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span>Featured Resources</span>
                </CardTitle>
                <CardDescription>
                  Curated collection of high-quality academic resources recommended by faculty
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge className={getCategoryColor(resource.category)}>
                        <span className="flex items-center space-x-1">
                          {getCategoryIcon(resource.category)}
                          <span>{resource.category.replace("-", " ")}</span>
                        </span>
                      </Badge>
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    </div>
                    <CardTitle className="text-xl">{resource.title}</CardTitle>
                    <CardDescription>{resource.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{resource.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getDepartmentIcon(resource.department)}
                        <span>{resource.department}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Download className="w-4 h-4" />
                          <span>{resource.downloads} downloads</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span>{resource.rating} rating</span>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{resource.size}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 bg-transparent"
                        onClick={() => handlePreview(resource.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleDownload(resource.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
