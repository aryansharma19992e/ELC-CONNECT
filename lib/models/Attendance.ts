import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAttendance extends Document {
  userId: mongoose.Types.ObjectId
  roomId: mongoose.Types.ObjectId
  bookingId: mongoose.Types.ObjectId
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'present' | 'absent' | 'late' | 'early_departure'
  qrCode?: string
  qrCodeData?: string // JSON string of QR data
  createdAt: Date
  updatedAt: Date
}

const AttendanceSchema: Schema<IAttendance> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
  date: { type: String, required: true, index: true },
  checkInTime: { type: String },
  checkOutTime: { type: String },
  status: { type: String, enum: ['present', 'absent', 'late', 'early_departure'], default: 'present', index: true },
  qrCode: { type: String },
  qrCodeData: { type: String } // Store QR code data as JSON string
}, { timestamps: true })

AttendanceSchema.index({ userId: 1, bookingId: 1 }, { unique: true })

export const Attendance: Model<IAttendance> = mongoose.models.Attendance || mongoose.model<IAttendance>('Attendance', AttendanceSchema)


