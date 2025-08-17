import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['lecture_notes', 'textbook', 'research_paper', 'presentation', 'video', 'other'],
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileSize: {
    type: String,
    trim: true
  },
  fileType: {
    type: String,
    trim: true
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  accessLevel: {
    type: String,
    enum: ['public', 'students', 'faculty', 'admin'],
    default: 'public'
  },
  department: {
    type: String,
    trim: true
  },
  courseCode: {
    type: String,
    trim: true
  },
  semester: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  thumbnail: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'pending_review'],
    default: 'active'
  }
}, {
  timestamps: true
})

// Indexes for better query performance
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' })
resourceSchema.index({ type: 1 })
resourceSchema.index({ category: 1 })
resourceSchema.index({ author: 1 })
resourceSchema.index({ department: 1 })
resourceSchema.index({ status: 1 })
resourceSchema.index({ isPublic: 1 })
resourceSchema.index({ accessLevel: 1 })
resourceSchema.index({ tags: 1 })

export default mongoose.models.Resource || mongoose.model('Resource', resourceSchema)

