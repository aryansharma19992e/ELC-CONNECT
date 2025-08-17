import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  floor: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Study Room', 'Computer Lab', 'Meeting Room', 'Lecture Hall', 'Conference Room', 'Workshop'],
    trim: true
  },
  equipment: [{
    type: String,
    trim: true
  }],
  available: {
    type: Boolean,
    default: true
  },
  building: {
    type: String,
    required: true,
    default: 'ELC',
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  maintenanceStatus: {
    type: String,
    enum: ['operational', 'maintenance', 'out_of_order'],
    default: 'operational'
  },
  maintenanceNotes: {
    type: String,
    trim: true
  },
  operatingHours: {
    start: {
      type: String,
      default: '08:00'
    },
    end: {
      type: String,
      default: '22:00'
    }
  },
  specialFeatures: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
})

// Indexes for better query performance
roomSchema.index({ roomId: 1 })
roomSchema.index({ type: 1 })
roomSchema.index({ floor: 1 })
roomSchema.index({ available: 1 })
roomSchema.index({ capacity: 1 })
roomSchema.index({ building: 1 })
roomSchema.index({ maintenanceStatus: 1 })

export default mongoose.models.Room || mongoose.model('Room', roomSchema)

