import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { Resource } from '@/lib/models/Resource'
import { requireAdmin } from '@/lib/auth-guard'

const resourceSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['lecture_notes', 'textbook', 'research_paper', 'presentation', 'video', 'other']),
  category: z.string().min(1),
  description: z.string().optional(),
  author: z.string().min(1),
  fileSize: z.string().optional(),
  fileType: z.string().optional(),
  tags: z.array(z.string()).optional()
})

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const query: any = { isActive: true }
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const author = searchParams.get('author')
    const search = searchParams.get('search')
    const tags = searchParams.get('tags')

    if (type) query.type = type
    if (category) query.category = category
    if (author) query.author = { $regex: author, $options: 'i' }
    if (search) query.title = { $regex: search, $options: 'i' }
    if (tags) query.tags = { $in: tags.split(',') }

    const items = await Resource.find(query).sort({ createdAt: -1 })
    const resources = items.map(r => ({
      id: r._id.toString(),
      title: r.title,
      type: r.type,
      category: r.category,
      description: r.description,
      author: r.author,
      fileSize: r.fileSize,
      fileType: r.fileType,
      downloadCount: r.downloadCount,
      tags: r.tags || [],
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString()
    }))
    return NextResponse.json({ success: true, resources, total: resources.length })
  } catch (error) {
    console.error('Resources GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const guard = requireRole(request, ['admin', 'faculty'])
    if (guard.error) return guard.error
    await connectToDatabase()
    const body = await request.json()
    const validatedData = resourceSchema.parse(body)
    const created = await Resource.create(validatedData)
    return NextResponse.json({ success: true, resource: {
      id: created._id.toString(),
      title: created.title,
      type: created.type,
      category: created.category,
      description: created.description,
      author: created.author,
      fileSize: created.fileSize,
      fileType: created.fileType,
      downloadCount: created.downloadCount,
      tags: created.tags || [],
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    }, message: 'Resource created successfully' }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Resources POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const guard = requireRole(request, ['admin', 'faculty'])
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 })

    const body = await request.json()
    await Resource.updateOne({ _id: id }, { $set: body })
    const updated = await Resource.findById(id)
    if (!updated) return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
    return NextResponse.json({ success: true, resource: {
      id: updated._id.toString(),
      title: updated.title,
      type: updated.type,
      category: updated.category,
      description: updated.description,
      author: updated.author,
      fileSize: updated.fileSize,
      fileType: updated.fileType,
      downloadCount: updated.downloadCount,
      tags: updated.tags || [],
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString()
    }, message: 'Resource updated successfully' })
  } catch (error) {
    console.error('Resources PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Resource ID is required' }, { status: 400 })

    await Resource.updateOne({ _id: id }, { $set: { isActive: false } })
    return NextResponse.json({ success: true, message: 'Resource deactivated successfully' })
  } catch (error) {
    console.error('Resources DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
