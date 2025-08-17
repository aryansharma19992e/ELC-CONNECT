# ELC Connect - Educational Learning Center Management System

A comprehensive resource management system for educational institutions, built with Next.js 15, TypeScript, Tailwind CSS, and MongoDB.

## 🚀 Features

- **User Management**: Student, Faculty, and Admin roles with secure authentication
- **Room Booking**: Smart room reservation system with conflict detection
- **Resource Library**: Digital resource management with search and filtering
- **Attendance Tracking**: QR-code based attendance system
- **Admin Dashboard**: Comprehensive system overview and management tools
- **Responsive Design**: Modern UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT tokens with bcrypt password hashing
- **Database**: MongoDB (local or cloud)
- **UI Components**: Radix UI, Lucide React icons
- **Validation**: Zod schema validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or pnpm
- MongoDB (local installation or MongoDB Atlas account)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd elc-connect
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the environment template and configure your MongoDB connection:

```bash
cp env.example .env.local
```

Edit `.env.local` with your MongoDB URI:

```env
MONGODB_URI=mongodb://localhost:27017/elc-connect
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB Installation

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Create database: `elc-connect`

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `.env.local`

### 5. Seed the Database

Run the database seeder to populate initial data:

```bash
npx tsx lib/seed.ts
```

This will create:
- 3 default users (student, faculty, admin)
- 4 sample rooms
- 3 sample resources

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Default Login Credentials

After seeding the database, you can use these credentials:

- **Student**: `student@university.edu` / `password123`
- **Faculty**: `faculty@university.edu` / `password123`
- **Admin**: `admin@university.edu` / `password123`

## 📁 Project Structure

```
elc-connect/
├── app/                    # Next.js 15 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── rooms/         # Room management
│   │   ├── bookings/      # Booking system
│   │   ├── users/         # User management
│   │   ├── attendance/    # Attendance tracking
│   │   └── resources/     # Resource management
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin dashboard
│   ├── login/             # Login page
│   └── signup/            # Registration page
├── components/             # Reusable UI components
├── lib/                    # Utility functions and models
│   ├── models/            # MongoDB schemas
│   ├── mongodb.ts         # Database connection
│   ├── auth.ts            # Authentication utilities
│   └── api.ts             # API client functions
├── public/                 # Static assets
└── styles/                 # Global styles
```

## 🗄️ Database Models

### User
- Authentication details (email, password)
- Role-based access control
- Profile information
- Department and student ID (for students)

### Room
- Room specifications (capacity, equipment, type)
- Availability status
- Maintenance information
- Operating hours

### Resource
- Digital content management
- File metadata and access control
- Search and categorization
- Download tracking

### Booking
- Room reservation system
- Conflict detection
- Approval workflow
- Usage tracking

### Attendance
- QR-code based check-in/out
- Location tracking
- Duration calculation
- Verification methods

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration

### Rooms
- `GET /api/rooms` - List rooms with filtering
- `POST /api/rooms` - Create new room

### Resources
- `GET /api/resources` - List resources with search
- `POST /api/resources` - Upload new resource
- `PUT /api/resources` - Update resource
- `DELETE /api/resources` - Delete resource

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings` - Update booking
- `DELETE /api/bookings` - Cancel booking

### Users
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users` - Update user
- `DELETE /api/users` - Deactivate user

### Attendance
- `GET /api/attendance` - List attendance records
- `POST /api/attendance` - Record attendance
- `PUT /api/attendance` - Update record
- `DELETE /api/attendance` - Remove record

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Other Platforms

1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set environment variables
4. Configure MongoDB connection

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation with Zod
- Role-based access control
- Secure API endpoints

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=api
```

## 📝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Real-time notifications
- Mobile app
- Advanced analytics
- Integration with LMS systems
- Multi-language support
- Advanced reporting
- Email notifications
- File upload system
- Payment integration for premium features

---

Built with ❤️ for educational institutions

