"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search, UserPlus, Edit, Trash2, Shield, Users, Calendar, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  role: 'faculty' | 'admin'
  department: string
  employeeId?: string
  phone?: string
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected'
  createdAt: string
  updatedAt: string
  adminUntil?: string
  isSuperAdmin?: boolean
  effectiveRole?: 'faculty' | 'admin'
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterDepartment, setFilterDepartment] = useState("all")
  const [totalUsers, setTotalUsers] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [grantOpen, setGrantOpen] = useState(false)
  const [grantUser, setGrantUser] = useState<User | null>(null)
  const [grantUntil, setGrantUntil] = useState("")

  // Fetch users from database
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const fetchUsers = async (page = 1) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      })

      if (searchQuery) params.append('search', searchQuery)
      if (filterRole !== 'all') params.append('role', filterRole)
      if (filterStatus !== 'all') params.append('status', filterStatus)
      if (filterDepartment !== 'all') params.append('department', filterDepartment)

      const response = await fetch(`/api/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        setTotalUsers(data.total || 0)
        setTotalPages(data.totalPages || 1)
        setCurrentPage(page)
      } else {
        console.error('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Detect super admin from stored user
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        const superEmail = process.env.NEXT_PUBLIC_SUPERADMIN_EMAIL
        setIsSuperAdmin(!!u.isSuperAdmin && (!superEmail || u.email === superEmail))
      }
    } catch {}
    fetchUsers()
  }, [searchQuery, filterRole, filterStatus, filterDepartment])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.ok) {
        // Refresh the users list
        fetchUsers(currentPage)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to deactivate user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to deactivate user')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'faculty': return 'bg-blue-100 text-blue-800'
      case 'admin': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const isTempAdmin = (u: User) => {
    if (!u.adminUntil) return false
    return new Date(u.adminUntil) > new Date()
  }

  const openGrantModal = (u: User) => {
    setGrantUser(u)
    // default to 7 days from now
    const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    setGrantUntil(local.toISOString().slice(0, 16)) // yyyy-MM-ddTHH:mm
    setGrantOpen(true)
  }

  const grantAdmin = async () => {
    if (!grantUser || !grantUntil) return
    const token = localStorage.getItem('token')
    const iso = new Date(grantUntil).toISOString()
    const res = await fetch(`/api/users?id=${grantUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ adminUntil: iso, role: 'admin' })
    })
    if (res.ok) {
      setGrantOpen(false)
      setGrantUser(null)
      fetchUsers(currentPage)
    }
  }

  const revokeAdmin = async (u: User) => {
    const token = localStorage.getItem('token')
    const past: null = null
    const res = await fetch(`/api/users?id=${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ adminUntil: past, role: 'faculty' })
    })
    if (res.ok) fetchUsers(currentPage)
  }

  // One-click quick grant: +7 days by default
  const quickGrantAdmin = async (u: User) => {
    const token = localStorage.getItem('token')
    const d = new Date(Date.now() + 7*24*60*60*1000)
    const iso = d.toISOString()
    const res = await fetch(`/api/users?id=${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ adminUntil: iso })
    })
    if (res.ok) fetchUsers(currentPage)
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const renderActions = (user: User) => {
    if (user.status === 'pending') {
      if (!isSuperAdmin) return null
      return (
        <>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700"
            onClick={async () => {
              const token = localStorage.getItem('token')
              const res = await fetch(`/api/users?id=${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'active' })
              })
              if (res.ok) fetchUsers(currentPage)
            }}
          >
            ✓
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              const token = localStorage.getItem('token')
              const res = await fetch(`/api/users?id=${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected' })
              })
              if (res.ok) fetchUsers(currentPage)
            }}
          >
            ✗
          </Button>
        </>
      )
    }

    return (
      <>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDeleteUser(user.id)}
          disabled={user.role === 'admin'}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        {user.isSuperAdmin ? (
          <Badge className="bg-purple-100 text-purple-800">Super Admin</Badge>
        ) : isSuperAdmin && (isTempAdmin(user) || user.effectiveRole === 'admin') ? (
          <Button variant="outline" size="sm" onClick={() => revokeAdmin(user)}>Revoke Admin</Button>
        ) : isSuperAdmin ? (
          <Button className="bg-purple-600 hover:bg-purple-700" size="sm" onClick={() => openGrantModal(user)}>Make Admin</Button>
        ) : null}
      </>
    )
  }

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href={isSuperAdmin ? "/superadmin/dashboard" : "/admin/dashboard"}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">User Directory</h1>
                <p className="text-sm text-gray-500">Manage system users and permissions {isSuperAdmin ? '(Super Admin)' : ''}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Role</label>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Department</label>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="Biology">Biology</SelectItem>
                    <SelectItem value="Chemistry">Chemistry</SelectItem>
                    <SelectItem value="Psychology">Psychology</SelectItem>
                    <SelectItem value="Economics">Economics</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="IT Services">IT Services</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({totalUsers})</CardTitle>
            <CardDescription>All registered users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading users...</span>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Admin Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={`/api/avatar/${user.id}`} alt={user.name} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor((user.effectiveRole || user.role))}>
                            {(user.effectiveRole || user.role).charAt(0).toUpperCase() + (user.effectiveRole || user.role).slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900">{user.department}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{user.employeeId || 'N/A'}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">{user.adminUntil ? new Date(user.adminUntil).toLocaleString() : '—'}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(user.createdAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {renderActions(user)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-700">
                  Showing page {currentPage} of {totalPages}
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchUsers(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <GrantAdminDialog 
          open={grantOpen} 
          onOpenChange={setGrantOpen} 
          user={grantUser} 
          until={grantUntil} 
          setUntil={setGrantUntil} 
          onConfirm={grantAdmin}
        />
      </div>
    </div>
  )
}

// Grant Admin Dialog
function GrantAdminDialog({ open, onOpenChange, user, until, setUntil, onConfirm }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  user: User | null
  until: string
  setUntil: (v: string) => void
  onConfirm: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Grant Admin Access</DialogTitle>
          <DialogDescription>
            Select how long {user?.name || 'this user'} should have admin access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Until</label>
            <input
              type="datetime-local"
              value={until}
              onChange={(e) => setUntil(e.target.value)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => {
              const d = new Date(Date.now() + 24*60*60*1000)
              const local = new Date(d.getTime() - d.getTimezoneOffset()*60000)
              setUntil(local.toISOString().slice(0,16))
            }}>+1 day</Button>
            <Button variant="outline" onClick={() => {
              const d = new Date(Date.now() + 7*24*60*60*1000)
              const local = new Date(d.getTime() - d.getTimezoneOffset()*60000)
              setUntil(local.toISOString().slice(0,16))
            }}>+1 week</Button>
            <Button variant="outline" onClick={() => {
              const d = new Date(Date.now() + 30*24*60*60*1000)
              const local = new Date(d.getTime() - d.getTimezoneOffset()*60000)
              setUntil(local.toISOString().slice(0,16))
            }}>+30 days</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={onConfirm}>Grant Admin</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
