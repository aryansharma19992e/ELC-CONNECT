import mongoose from 'mongoose'

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkInTime: {
    type: String,
    required: true
  },
  checkOutTime: {
    type: String
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'early_departure'],
    default: 'present'
  },
  qrCode: {
    type: String,
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  location: {
    type: {
      latitude: Number,
      longitude: Number
    }
  },
  deviceInfo: {
    type: {
      deviceId: String,
      deviceType: String,
      browser: String,
      ipAddress: String
    }
  }
}, {
  timestamps: true
})

// Indexes for better query performance
attendanceSchema.index({ userId: 1 })
attendanceSchema.index({ roomId: 1 })
attendanceSchema.index({ date: 1 })
attendanceSchema.index({ status: 1 })
attendanceSchema.index({ qrCode: 1 })

// Compound index for user attendance queries
attendanceSchema.index({ userId: 1, date: 1 })
attendanceSchema.index({ roomId: 1, date: 1 })

// Ensure one attendance record per user per room per day
attendanceSchema.index(
  { userId: 1, roomId: 1, date: 1 },
  { unique: true }
)

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema)

