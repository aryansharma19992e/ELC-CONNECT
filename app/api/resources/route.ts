import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import dbConnect from '@/lib/mongodb'
import Resource from '@/lib/models/Resource'
import { requireRole } from '@/lib/middleware'

const resourceQuerySchema = z.object({
  type: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  search: z.string().optional(),
  tags: z.string().optional()
})

const createResourceSchema = z.object({
  title: z.string().min(1),
  type: z.string().min(1),
  category: z.string().min(1),
  description: z.string().min(1),
  author: z.string().min(1),
  fileUrl: z.string().url().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().optional(),
  accessLevel: z.enum(['public', 'department', 'faculty', 'admin']).optional(),
  department: z.string().min(1),
  courseCode: z.string().optional(),
  semester: z.string().optional(),
  year: z.number().optional(),
  thumbnail: z.string().url().optional()
})

export async function GET(request: NextRequest) {
  try {
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())
    
    // Validate query parameters
    const validatedQuery = resourceQuerySchema.parse(query)
    
    // Build filter object
    const filter: any = { status: 'active' }
    
    if (validatedQuery.type) {
      filter.type = validatedQuery.type
    }
    
    if (validatedQuery.category) {
      filter.category = { $regex: validatedQuery.category, $options: 'i' }
    }
    
    if (validatedQuery.author) {
      filter.author = { $regex: validatedQuery.author, $options: 'i' }
    }
    
    if (validatedQuery.search) {
      filter.$text = { $search: validatedQuery.search }
    }
    
    if (validatedQuery.tags) {
      const searchTags = validatedQuery.tags.split(',').map(tag => tag.trim())
      filter.tags = { $in: searchTags }
    }
    
    // Build query
    let resourcesQuery = Resource.find(filter)
    
    // If text search is used, sort by text score
    if (validatedQuery.search) {
      resourcesQuery = resourcesQuery.sort({ score: { $meta: 'textScore' } })
    } else {
      resourcesQuery = resourcesQuery.sort({ createdAt: -1 })
    }
    
    const resources = await resourcesQuery
    
    return NextResponse.json({
      success: true,
      resources,
      total: resources.length
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Resources GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require faculty or admin role to create resources
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const body = await request.json()
    const validatedData = createResourceSchema.parse(body)
    
    const newResource = new Resource({
      title: validatedData.title,
      type: validatedData.type,
      category: validatedData.category,
      description: validatedData.description,
      author: validatedData.author,
      fileUrl: validatedData.fileUrl,
      fileSize: validatedData.fileSize,
      fileType: validatedData.fileType,
      tags: validatedData.tags || [],
      isPublic: validatedData.isPublic !== false,
      accessLevel: validatedData.accessLevel || 'public',
      department: validatedData.department,
      courseCode: validatedData.courseCode,
      semester: validatedData.semester,
      year: validatedData.year,
      thumbnail: validatedData.thumbnail,
      status: 'active'
    })
    
    await newResource.save()
    
    return NextResponse.json({
      success: true,
      resource: newResource,
      message: 'Resource created successfully'
    }, { status: 201 })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Resources POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Require faculty or admin role to update resources
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('id')
    
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    
    if (!updatedResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      resource: updatedResource,
      message: 'Resource updated successfully'
    })
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Resources PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require faculty or admin role to delete resources
    const authResult = await requireRole(['faculty', 'admin'])(request)
    if (authResult) return authResult
    
    await dbConnect()
    
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('id')
    
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }
    
    // Soft delete - mark as inactive
    const deletedResource = await Resource.findByIdAndUpdate(
      resourceId,
      { status: 'inactive', updatedAt: new Date() },
      { new: true }
    )
    
    if (!deletedResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })
    
  } catch (error) {
    console.error('Resources DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
