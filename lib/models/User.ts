import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  role: 'faculty' | 'admin'
  department: string
  employeeId?: string
  phone?: string
  adminUntil?: Date
  isSuperAdmin?: boolean
  status: 'pending' | 'active' | 'inactive' | 'suspended' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['faculty', 'admin'], required: true },
    department: { type: String, required: true },
    employeeId: { type: String, index: true, sparse: true, unique: true },
    phone: { type: String },
    adminUntil: { type: Date },
    isSuperAdmin: { type: Boolean, default: false, index: true },
    status: { type: String, enum: ['pending', 'active', 'inactive', 'suspended', 'rejected'], default: 'pending' }
  },
  { timestamps: true }
)

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)


