import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { requireAdmin, requireSuperAdmin } from '@/lib/auth-guard'

const userQuerySchema = z.object({
  role: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
})

const createUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['faculty', 'admin']),
  name: z.string().min(1),
  department: z.string().min(1),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['pending', 'active', 'inactive', 'suspended', 'rejected']).default('pending')
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
  adminUntil: z.union([z.string().datetime(), z.null()]).optional(),
  role: z.enum(['faculty', 'admin']).optional(),
  status: z.enum(['pending', 'active', 'inactive', 'suspended', 'rejected']).optional()
})

export async function GET(request: NextRequest) {
  try {
    const guard = await requireAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const query = Object.fromEntries(searchParams.entries())

    const validatedQuery = userQuerySchema.parse(query)

    const mongoQuery: any = {}
    if (validatedQuery.role) mongoQuery.role = validatedQuery.role
    if (validatedQuery.status) mongoQuery.status = validatedQuery.status
    if (validatedQuery.department) mongoQuery.department = { $regex: validatedQuery.department, $options: 'i' }

    const page = parseInt(validatedQuery.page || '1')
    const limit = parseInt(validatedQuery.limit || '10')
    const skip = (page - 1) * limit

    const search = validatedQuery.search
    if (search) {
      mongoQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ]
    }

    const [items, total] = await Promise.all([
      User.find(mongoQuery).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(mongoQuery)
    ])

    const now = new Date()
    const users = items.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department,
      employeeId: u.employeeId,
      phone: u.phone,
      adminUntil: u.adminUntil && u.adminUntil > now ? u.adminUntil : null,
      isSuperAdmin: u.isSuperAdmin,
      effectiveRole: (u.isSuperAdmin || (u.adminUntil && u.adminUntil > new Date())) ? 'admin' : u.role,
      status: u.status,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString()
    }))

    return NextResponse.json({ success: true, users, total, page, limit, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: error.errors }, { status: 400 })
    }
    console.error('Users GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// (moved) GET /api/users/me is implemented in app/api/users/me/route.ts

export async function POST(request: NextRequest) {
  try {
    // Creating users is allowed for superadmin only
    const guard = await requireSuperAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const body = await request.json()
    const validatedData = createUserSchema.parse(body)

    const exists = await User.findOne({ email: validatedData.email })
    if (exists) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    if (validatedData.role === 'faculty' && validatedData.employeeId) {
      const dup = await User.findOne({ employeeId: validatedData.employeeId })
      if (dup) {
        return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
      }
    }

    const created = await User.create(validatedData)

    return NextResponse.json({
      success: true,
      user: {
        id: created._id.toString(),
        name: created.name,
        email: created.email,
        role: created.role,
        department: created.department,
        employeeId: created.employeeId,
        phone: created.phone,
        status: created.status,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt
      },
      message: 'User created successfully'
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Users POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Updating users (status, adminUntil, role) is allowed for superadmin only
    const guard = await requireSuperAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    const body = await request.json()
    const validatedData = updateUserSchema.parse(body)

    const existing = await User.findById(userId)
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (existing.isSuperAdmin) return NextResponse.json({ error: 'Cannot modify super admin' }, { status: 400 })

    if (validatedData.employeeId) {
      const dup = await User.findOne({ employeeId: validatedData.employeeId, _id: { $ne: existing._id } })
      if (dup) return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
    }

    const updates: any = { ...validatedData }
    if (updates.adminUntil !== undefined) {
      updates.adminUntil = updates.adminUntil === null ? null : new Date(updates.adminUntil)
    }
    await User.updateOne({ _id: existing._id }, { $set: updates })
    const updated = await User.findById(existing._id)

    return NextResponse.json({
      success: true,
      user: {
        id: updated!._id.toString(),
        name: updated!.name,
        email: updated!.email,
        role: updated!.role,
        department: updated!.department,
        employeeId: updated!.employeeId,
        phone: updated!.phone,
        adminUntil: updated!.adminUntil,
        status: updated!.status,
        createdAt: updated!.createdAt,
        updatedAt: updated!.updatedAt
      },
      message: 'User updated successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Users PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Deleting/deactivating users is allowed for superadmin only
    const guard = await requireSuperAdmin(request)
    if (guard.error) return guard.error
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    const existing = await User.findById(userId)
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (existing.isSuperAdmin) return NextResponse.json({ error: 'Cannot delete super admin' }, { status: 400 })

    await User.updateOne({ _id: existing._id }, { $set: { status: 'inactive' } })
    return NextResponse.json({ success: true, message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Users DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

