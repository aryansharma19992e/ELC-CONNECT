import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Mock data
let resources = [
  {
    id: '1',
    name: 'Projector',
    type: 'equipment',
    quantity: 5,
    isAvailable: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Whiteboard',
    type: 'furniture',
    quantity: 10,
    isAvailable: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Laptop',
    type: 'equipment',
    quantity: 3,
    isAvailable: false,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const resourceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['equipment', 'furniture', 'software', 'other']),
  quantity: z.number().min(1),
  isAvailable: z.boolean().default(true)
})

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      resources: resources.filter(resource => resource.isActive)
    })
  } catch (error) {
    console.error('Resources GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = resourceSchema.parse(body)
    
    const newResource = {
      ...validatedData,
      id: (resources.length + 1).toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    resources.push(newResource)
    
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
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('id')
    
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }
    
    const body = await request.json()
    
    const existingResource = resources.find(resource => resource.id === resourceId)
    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    const updatedResource = { ...existingResource, ...body, updatedAt: new Date().toISOString() }
    const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
    resources[resourceIndex] = updatedResource
    
    return NextResponse.json({
      success: true,
      resource: updatedResource,
      message: 'Resource updated successfully'
    })
    
  } catch (error) {
    console.error('Resources PUT error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('id')
    
    if (!resourceId) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      )
    }
    
    const existingResource = resources.find(resource => resource.id === resourceId)
    if (!existingResource) {
      return NextResponse.json(
        { error: 'Resource not found' },
        { status: 404 }
      )
    }
    
    // Soft delete - mark as inactive
    const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
    resources[resourceIndex] = { ...existingResource, isActive: false, updatedAt: new Date().toISOString() }
    
    return NextResponse.json({
      success: true,
      message: 'Resource deactivated successfully'
    })
    
  } catch (error) {
    console.error('Resources DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
