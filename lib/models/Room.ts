import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRoom extends Document {
  name: string
  capacity: number
  type: 'computer_lab' | 'conference_room' | 'study_room' | 'classroom' | 'other'
  building: string
  floor: string
  description?: string
  equipment?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const RoomSchema: Schema<IRoom> = new Schema(
  {
    name: { type: String, required: true },
    capacity: { type: Number, required: true },
    type: { type: String, enum: ['computer_lab', 'conference_room', 'study_room', 'classroom', 'other'], required: true },
    building: { type: String, required: true },
    floor: { type: String, required: true },
    description: { type: String },
    equipment: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export const Room: Model<IRoom> = mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema)


