import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'faculty', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  studentId: {
    type: String,
    required: function() { return this.role === 'student'; },
    unique: function() { return this.role === 'student'; },
    sparse: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Indexes for better query performance
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ department: 1 })
userSchema.index({ status: 1 })
userSchema.index({ studentId: 1 })

// Prevent password from being returned in queries
userSchema.methods.toJSON = function() {
  const user = this.toObject()
  delete user.password
  return user
}

export default mongoose.models.User || mongoose.model('User', userSchema)

