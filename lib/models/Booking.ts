import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId
  roomId: mongoose.Types.ObjectId
  date: string
  startTime: string
  endTime: string
  purpose: string
  attendees?: number
  equipment?: string[]
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: Date
  updatedAt: Date
}

const BookingSchema: Schema<IBooking> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    purpose: { type: String, required: true },
    attendees: { type: Number },
    equipment: [{ type: String }],
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending', index: true }
  },
  { timestamps: true }
)

export const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)


