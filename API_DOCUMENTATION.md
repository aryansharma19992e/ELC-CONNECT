# ELC Connect API Documentation

## Overview
The ELC Connect API provides a comprehensive backend for managing educational facility bookings, attendance tracking, resource management, and user administration.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Error Handling
All endpoints return consistent error responses:
```json
{
  "error": "Error type",
  "message": "Human readable error message",
  "details": "Additional error details (if applicable)"
}
```

## Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes
- **General API**: 100 requests per minute
- **Strict endpoints**: 10 requests per minute

---

## Authentication Endpoints

### POST /api/auth/login
User login endpoint.

**Request Body:**
```json
{
  "email": "user@university.edu",
  "password": "password123",
  "role": "student"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@university.edu",
    "name": "John Doe",
    "role": "student",
    "department": "Computer Science"
  },
  "token": "jwt_token_here",
  "message": "Login successful"
}
```

### POST /api/auth/signup
User registration endpoint.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "studentId": "STU123456"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "john.doe@university.edu",
    "name": "John Doe",
    "role": "student",
    "department": "Computer Science",
    "studentId": "STU123456"
  },
  "message": "User created successfully"
}
```

---

## User Management

### GET /api/users
Get all users (Admin/Faculty only).

**Query Parameters:**
- `role`: Filter by user role
- `department`: Filter by department
- `status`: Filter by status
- `search`: Search by name, email, or student ID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "users": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### POST /api/users
Create new user (Admin only).

**Request Body:**
```json
{
  "email": "newuser@university.edu",
  "role": "student",
  "name": "New User",
  "department": "Engineering",
  "studentId": "STU789012"
}
```

### PUT /api/users?id={userId}
Update user (Admin only).

**Request Body:**
```json
{
  "name": "Updated Name",
  "department": "Updated Department"
}
```

### DELETE /api/users?id={userId}
Deactivate user (Admin only).

---

## User Profile Management

### GET /api/users/profile
Get current user's profile.

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "user_id",
    "email": "user@university.edu",
    "name": "John Doe",
    "role": "student",
    "department": "Computer Science"
  }
}
```

### PUT /api/users/profile
Update current user's profile.

**Request Body:**
```json
{
  "name": "Updated Name",
  "department": "Updated Department",
  "phone": "+1234567890"
}
```

### PATCH /api/users/profile
Change password.

**Request Body:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Room Management

### GET /api/rooms
Get all available rooms.

**Query Parameters:**
- `available`: Filter by availability (true/false)
- `type`: Filter by room type
- `capacity`: Filter by minimum capacity
- `equipment`: Filter by equipment
- `floor`: Filter by floor

**Response:**
```json
{
  "success": true,
  "rooms": [
    {
      "_id": "room_id",
      "roomId": "A-201",
      "name": "Computer Lab A-201",
      "capacity": 30,
      "type": "computer_lab",
      "equipment": ["Computers", "Projector"],
      "available": true,
      "floor": "2nd Floor"
    }
  ],
  "total": 25
}
```

### POST /api/rooms
Create new room (Admin/Faculty only).

**Request Body:**
```json
{
  "roomId": "B-105",
  "name": "Conference Room B-105",
  "capacity": 20,
  "floor": "1st Floor",
  "type": "conference",
  "equipment": ["Projector", "Whiteboard"],
  "building": "ELC"
}
```

### PUT /api/rooms?id={roomId}
Update room (Admin/Faculty only).

### DELETE /api/rooms?id={roomId}
Decommission room (Admin only).

---

## Booking Management

### GET /api/bookings
Get bookings with filters.

**Query Parameters:**
- `userId`: Filter by user ID
- `roomId`: Filter by room ID
- `date`: Filter by date (YYYY-MM-DD)
- `status`: Filter by status
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "bookings": [
    {
      "_id": "booking_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@university.edu"
      },
      "roomId": {
        "_id": "room_id",
        "name": "Computer Lab A-201",
        "roomId": "A-201"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "startTime": "14:00",
      "endTime": "16:00",
      "purpose": "Group Study",
      "status": "confirmed"
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### POST /api/bookings
Create new booking.

**Request Body:**
```json
{
  "roomId": "room_id",
  "date": "2024-01-20",
  "startTime": "14:00",
  "endTime": "16:00",
  "purpose": "Group Study",
  "attendees": 5,
  "equipment": ["Projector"],
  "notes": "Need projector for presentation"
}
```

### PUT /api/bookings?id={bookingId}
Update booking (owner or admin only).

### DELETE /api/bookings?id={bookingId}
Cancel booking (owner or admin only).

---

## Booking Approval

### GET /api/bookings/approve
Get pending bookings for approval (Faculty/Admin only).

**Query Parameters:**
- `status`: Filter by status (default: pending)
- `page`: Page number
- `limit`: Items per page

### POST /api/bookings/approve?id={bookingId}
Approve or reject booking (Faculty/Admin only).

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Approved for academic use"
}
```

**Or for rejection:**
```json
{
  "status": "rejected",
  "rejectionReason": "Room already booked for this time",
  "notes": "Please choose another time slot"
}
```

---

## Attendance Management

### GET /api/attendance
Get attendance records.

**Query Parameters:**
- `userId`: Filter by user ID
- `roomId`: Filter by room ID
- `date`: Filter by date (YYYY-MM-DD)
- `status`: Filter by status
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "success": true,
  "attendance": [
    {
      "_id": "attendance_id",
      "userId": {
        "_id": "user_id",
        "name": "John Doe",
        "role": "student"
      },
      "roomId": {
        "_id": "room_id",
        "name": "Computer Lab A-201"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "checkInTime": "14:00",
      "status": "present",
      "qrCode": "QR_A-201_1234567890_abc123"
    }
  ],
  "total": 25
}
```

### POST /api/attendance
Record attendance.

**Request Body:**
```json
{
  "roomId": "room_id",
  "qrCode": "QR_A-201_1234567890_abc123"
}
```

### PUT /api/attendance?id={recordId}
Update attendance record (owner or admin only).

### DELETE /api/attendance?id={recordId}
Delete attendance record (Admin only).

---

## QR Code Management

### POST /api/attendance/qr-generate
Generate QR code for room (Faculty/Admin only).

**Request Body:**
```json
{
  "roomId": "room_id",
  "expiryMinutes": 120
}
```

**Response:**
```json
{
  "success": true,
  "qrCode": "QR_A-201_1234567890_abc123",
  "roomName": "Computer Lab A-201",
  "expiryTime": "2024-01-20T16:00:00.000Z",
  "message": "QR code generated successfully"
}
```

### GET /api/attendance/qr-generate
Get active QR codes (Faculty/Admin only).

---

## Resource Management

### GET /api/resources
Get educational resources.

**Query Parameters:**
- `type`: Filter by resource type
- `category`: Filter by category
- `author`: Filter by author
- `search`: Text search
- `tags`: Filter by tags (comma-separated)

**Response:**
```json
{
  "success": true,
  "resources": [
    {
      "_id": "resource_id",
      "title": "Introduction to Computer Science",
      "type": "document",
      "category": "Computer Science",
      "author": "Dr. Smith",
      "description": "Comprehensive guide to CS fundamentals",
      "tags": ["programming", "algorithms", "data-structures"],
      "fileUrl": "https://example.com/resource.pdf",
      "isPublic": true
    }
  ],
  "total": 100
}
```

### POST /api/resources
Create new resource (Faculty/Admin only).

**Request Body:**
```json
{
  "title": "Advanced Algorithms",
  "type": "document",
  "category": "Computer Science",
  "description": "Advanced algorithmic concepts",
  "author": "Dr. Johnson",
  "fileUrl": "https://example.com/algorithms.pdf",
  "tags": ["algorithms", "complexity"],
  "department": "Computer Science",
  "isPublic": true
}
```

### PUT /api/resources?id={resourceId}
Update resource (Faculty/Admin only).

### DELETE /api/resources?id={resourceId}
Delete resource (Faculty/Admin only).

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

---

## Data Models

### User
```typescript
{
  _id: ObjectId,
  email: string,
  password: string,
  name: string,
  role: 'student' | 'faculty' | 'admin',
  department: string,
  studentId?: string,
  status: 'active' | 'inactive' | 'suspended',
  lastLogin?: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Room
```typescript
{
  _id: ObjectId,
  roomId: string,
  name: string,
  capacity: number,
  floor: string,
  type: string,
  equipment: string[],
  available: boolean,
  building: string,
  description: string,
  maintenanceStatus: 'operational' | 'maintenance' | 'decommissioned',
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  roomId: ObjectId,
  date: Date,
  startTime: string,
  endTime: string,
  purpose: string,
  attendees: number,
  equipment: string[],
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected',
  notes?: string,
  approvedBy?: ObjectId,
  approvedAt?: Date,
  rejectionReason?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance
```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  roomId: ObjectId,
  date: Date,
  checkInTime: string,
  checkOutTime?: string,
  status: 'present' | 'absent' | 'late' | 'early_departure',
  qrCode: string,
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Resource
```typescript
{
  _id: ObjectId,
  title: string,
  type: string,
  category: string,
  description: string,
  author: string,
  fileUrl?: string,
  fileSize?: number,
  fileType?: string,
  tags: string[],
  isPublic: boolean,
  accessLevel: 'public' | 'department' | 'faculty' | 'admin',
  department: string,
  courseCode?: string,
  semester?: string,
  year?: number,
  thumbnail?: string,
  status: 'active' | 'inactive',
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Role-based Access Control**: Different permissions for students, faculty, and admins
3. **Input Validation**: Zod schema validation for all inputs
4. **Rate Limiting**: Protection against API abuse
5. **Password Hashing**: Bcrypt for secure password storage
6. **CORS Protection**: Configured for security
7. **Error Handling**: Consistent error responses without information leakage

---

## Usage Examples

### Frontend Integration

```typescript
// Login
const login = async (email: string, password: string, role: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role })
  });
  
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  }
  
  throw new Error('Login failed');
};

// Authenticated request
const getBookings = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

### Error Handling

```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.status === 401) {
    // Handle authentication error
    redirectToLogin();
  } else if (error.status === 403) {
    // Handle authorization error
    showAccessDenied();
  } else if (error.status === 429) {
    // Handle rate limiting
    showRateLimitMessage(error.retryAfter);
  }
}
```

---

## Development Notes

- All endpoints use MongoDB with Mongoose ODM
- JWT tokens expire after 7 days by default
- Passwords are hashed using bcrypt with 12 salt rounds
- API responses are paginated where appropriate
- Soft deletes are used for data integrity
- Comprehensive logging for debugging and monitoring
