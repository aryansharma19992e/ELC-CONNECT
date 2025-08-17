"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, Plus, Edit, Trash2, Upload, Star, Calendar, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function AdminResourcesPage() {
  const [resources, setResources] = useState([
    {
      id: 1,
      title: "Machine Learning Algorithms Implementation",
      author: "Dr. Sarah Johnson",
      department: "Computer Science",
      category: "research",
      type: "pdf",
      size: "2.4 MB",
      downloads: 156,
      rating: 4.8,
      uploadDate: "2024-01-15",
      status: "approved",
      featured: true,
    },
    {
      id: 2,
      title: "Sustainable Energy Systems Project",
      author: "Alex Chen",
      department: "Engineering",
      category: "project",
      type: "zip",
      size: "15.7 MB",
      downloads: 89,
      rating: 4.6,
      uploadDate: "2024-01-10",
      status: "approved",
      featured: false,
    },
    {
      id: 3,
      title: "Advanced Calculus Study Guide",
      author: "Prof. Michael Davis",
      department: "Mathematics",
      category: "study-material",
      type: "pdf",
      size: "5.2 MB",
      downloads: 234,
      rating: 4.9,
      uploadDate: "2024-01-08",
      status: "approved",
      featured: true,
    },
    {
      id: 4,
      title: "Quantum Computing Research Paper",
      author: "Dr. Lisa Wang",
      department: "Physics",
      category: "research",
      type: "pdf",
      size: "1.8 MB",
      downloads: 67,
      rating: 4.7,
      uploadDate: "2024-01-05",
      status: "pending",
      featured: false,
    },
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    tags: "",
  })

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.author.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = filterCategory === "all" || resource.category === filterCategory
    const matchesStatus = filterStatus === "all" || resource.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleApprove = (resourceId: number) => {
    setResources(
      resources.map((resource) => (resource.id === resourceId ? { ...resource, status: "approved" } : resource)),
    )
  }

  const handleReject = (resourceId: number) => {
    setResources(
      resources.map((resource) => (resource.id === resourceId ? { ...resource, status: "rejected" } : resource)),
    )
  }

  const handleToggleFeatured = (resourceId: number) => {
    setResources(
      resources.map((resource) =>
        resource.id === resourceId ? { ...resource, featured: !resource.featured } : resource,
      ),
    )
  }

  const handleDelete = (resourceId: number) => {
    if (confirm("Are you sure you want to delete this resource?")) {
      setResources(resources.filter((resource) => resource.id !== resourceId))
    }
  }

  const handleUpload = () => {
    // Handle file upload logic
    const newId = Math.max(...resources.map((r) => r.id)) + 1
    const uploadedResource = {
      id: newId,
      title: newResource.title,
      author: "Current User", // This would come from auth context
      department: newResource.department,
      category: newResource.category,
      type: "pdf", // This would be determined from uploaded file
      size: "1.2 MB", // This would be calculated from uploaded file
      downloads: 0,
      rating: 0,
      uploadDate: new Date().toISOString().split("T")[0],
      status: "pending" as const,
      featured: false,
    }

    setResources([...resources, uploadedResource])
    setNewResource({ title: "", description: "", category: "", department: "", tags: "" })
    setIsUploadDialogOpen(false)
    alert("Resource uploaded successfully!")
  }

  const resourceStats = {
    total: resources.length,
    approved: resources.filter((r) => r.status === "approved").length,
    pending: resources.filter((r) => r.status === "pending").length,
    featured: resources.filter((r) => r.featured).length,
    totalDownloads: resources.reduce((sum, r) => sum + r.downloads, 0),
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
                <h1 className="text-lg font-semibold text-gray-900">Resource Management</h1>
                <p className="text-sm text-gray-500">Manage digital repository and academic resources</p>
              </div>
            </div>

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload New Resource</DialogTitle>
                  <DialogDescription>Add a new academic resource to the digital repository.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      placeholder="Resource title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      placeholder="Brief description of the resource"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newResource.category}
                        onValueChange={(value) => setNewResource({ ...newResource, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="research">Research</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="study-material">Study Material</SelectItem>
                          <SelectItem value="course-material">Course Material</SelectItem>
                          <SelectItem value="lab-report">Lab Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="department">Department</Label>
                      <Select
                        value={newResource.department}
                        onValueChange={(value) => setNewResource({ ...newResource, department: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Biomedical Engineering">Biomedical Engineering</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={newResource.tags}
                      onChange={(e) => setNewResource({ ...newResource, tags: e.target.value })}
                      placeholder="machine-learning, algorithms, python"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="file">File Upload</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500">PDF, ZIP, DOC files up to 50MB</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleUpload}>
                    Upload Resource
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resource Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Resources</p>
                  <p className="text-2xl font-bold text-gray-900">{resourceStats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{resourceStats.approved}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{resourceStats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">{resourceStats.featured}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">{resourceStats.totalDownloads}</p>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
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
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Showing: {filteredResources.length} resources</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Table */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Directory</CardTitle>
            <CardDescription>Manage all academic resources and their approval status</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-900">{resource.title}</p>
                          {resource.featured && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{resource.type.toUpperCase()}</span>
                          <span>•</span>
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>{new Date(resource.uploadDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(resource.category)}>
                        {resource.category.replace("-", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.author}</TableCell>
                    <TableCell>{resource.department}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(resource.status)}>
                        {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{resource.downloads}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{resource.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {resource.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 hover:text-green-700 bg-transparent"
                              onClick={() => handleApprove(resource.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleReject(resource.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => handleToggleFeatured(resource.id)}
                        >
                          <Star
                            className={`w-4 h-4 ${resource.featured ? "text-yellow-500 fill-current" : "text-gray-400"}`}
                          />
                        </Button>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDelete(resource.id)}
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
