import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'student' | 'faculty' | 'admin'
  department: string
  studentId?: string
  status: 'active' | 'inactive' | 'suspended'
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['student', 'faculty', 'admin'], required: true },
    department: { type: String, required: true },
    studentId: { type: String, index: true, sparse: true },
    status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' }
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)


