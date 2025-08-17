import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
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
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  attendees: {
    type: Number,
    required: true,
    min: 1
  },
  equipment: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  actualAttendees: {
    type: Number,
    min: 0
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true
})

// Indexes for better query performance
bookingSchema.index({ userId: 1 })
bookingSchema.index({ roomId: 1 })
bookingSchema.index({ date: 1 })
bookingSchema.index({ status: 1 })
bookingSchema.index({ startTime: 1 })
bookingSchema.index({ endTime: 1 })
bookingSchema.index({ createdAt: 1 })

// Compound index for room availability queries
bookingSchema.index({ roomId: 1, date: 1, status: 1 })

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema)

