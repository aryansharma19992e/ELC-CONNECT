// API utility functions for ELC Connect

const API_BASE = '/api'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface User {
  id: string
  email: string
  role: 'student' | 'faculty' | 'admin'
  name: string
  department: string
  studentId?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt?: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  floor: string
  type: string
  equipment: string[]
  available: boolean
  building: string
  description: string
}

export interface Booking {
  id: string
  userId: string
  userName: string
  roomId: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  purpose: string
  attendees: number
  equipment: string[]
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
  updatedAt?: string
}

export interface AttendanceRecord {
  id: string
  userId: string
  userName: string
  roomId: string
  roomName: string
  date: string
  checkInTime: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'late' | 'early_departure'
  qrCode: string
  createdAt: string
  updatedAt?: string
}

export interface Resource {
  id: string
  title: string
  type: 'lecture_notes' | 'textbook' | 'research_paper' | 'presentation' | 'video' | 'other'
  category: string
  description: string
  author: string
  fileSize?: string
  fileType?: string
  downloadCount: number
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
      }
    }

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// Authentication API calls
export const authApi = {
  login: async (email: string, password: string, role: string) => {
    const res = await apiCall<{ success: boolean; user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
    if (res.success && res.data?.token) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', res.data.token)
      }
    }
    return res
  },

  signup: async (userData: {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'student' | 'faculty'
    department: string
    studentId?: string
  }) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },
}

// Rooms API calls
export const roomsApi = {
  getAll: async (filters?: {
    available?: boolean
    type?: string
    capacity?: number
    equipment?: string
    floor?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/rooms?${queryString}` : '/rooms'
    return apiCall<{ rooms: Room[]; total: number }>(endpoint)
  },

  create: async (roomData: Omit<Room, 'id'>) => {
    return apiCall<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    })
  },
}

// Bookings API calls
export const bookingsApi = {
  getAll: async (filters?: {
    userId?: string
    roomId?: string
    date?: string
    status?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/bookings?${queryString}` : '/bookings'
    return apiCall<{ bookings: Booking[]; total: number }>(endpoint)
  },

  create: async (bookingData: {
    userId: string
    roomId: string
    date: string
    startTime: string
    endTime: string
    purpose: string
    attendees: number
    equipment?: string[]
  }) => {
    return apiCall<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    })
  },

  update: async (id: string, updates: Partial<Booking>) => {
    return apiCall<Booking>(`/bookings?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  cancel: async (id: string) => {
    return apiCall(`/bookings?id=${id}`, {
      method: 'DELETE',
    })
  },
}

// Users API calls
export const usersApi = {
  getAll: async (filters?: {
    role?: string
    department?: string
    status?: string
    search?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/users?${queryString}` : '/users'
    return apiCall<{ users: User[]; total: number }>(endpoint)
  },

  create: async (userData: Omit<User, 'id' | 'createdAt'>) => {
    return apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  update: async (id: string, updates: Partial<User>) => {
    return apiCall<User>(`/users?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  deactivate: async (id: string) => {
    return apiCall(`/users?id=${id}`, {
      method: 'DELETE',
    })
  },
}

// Attendance API calls
export const attendanceApi = {
  getAll: async (filters?: {
    userId?: string
    roomId?: string
    date?: string
    status?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/attendance?${queryString}` : '/attendance'
    return apiCall<{ attendance: AttendanceRecord[]; total: number }>(endpoint)
  },

  create: async (attendanceData: {
    userId: string
    roomId: string
    date: string
    qrCode: string
    checkInTime?: string
    checkOutTime?: string
  }) => {
    return apiCall<AttendanceRecord>('/attendance', {
      method: 'POST',
      body: JSON.stringify(attendanceData),
    })
  },

  update: async (id: string, updates: Partial<AttendanceRecord>) => {
    return apiCall<AttendanceRecord>(`/attendance?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  delete: async (id: string) => {
    return apiCall(`/attendance?id=${id}`, {
      method: 'DELETE',
    })
  },
}

// Resources API calls
export const resourcesApi = {
  getAll: async (filters?: {
    type?: string
    category?: string
    author?: string
    search?: string
    tags?: string
  }) => {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `/resources?${queryString}` : '/resources'
    return apiCall<{ resources: Resource[]; total: number }>(endpoint)
  },

  create: async (resourceData: Omit<Resource, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>) => {
    return apiCall<Resource>('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    })
  },

  update: async (id: string, updates: Partial<Resource>) => {
    return apiCall<Resource>(`/resources?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  },

  delete: async (id: string) => {
    return apiCall(`/resources?id=${id}`, {
      method: 'DELETE',
    })
  },
}

