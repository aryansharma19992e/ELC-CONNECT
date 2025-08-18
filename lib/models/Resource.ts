import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IResource extends Document {
  title: string
  type: 'lecture_notes' | 'textbook' | 'research_paper' | 'presentation' | 'video' | 'other'
  category: string
  description?: string
  author: string
  fileSize?: string
  fileType?: string
  downloadCount: number
  tags?: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const ResourceSchema: Schema<IResource> = new Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['lecture_notes', 'textbook', 'research_paper', 'presentation', 'video', 'other'], required: true },
    category: { type: String, required: true },
    description: { type: String },
    author: { type: String, required: true },
    fileSize: { type: String },
    fileType: { type: String },
    downloadCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
)

export const Resource: Model<IResource> = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema)


