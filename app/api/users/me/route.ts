import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'

export async function GET(request: NextRequest) {
  const auth = requireAuth(request)
  if (auth.error) return auth.error!
  await connectToDatabase()
  const u = await User.findById(auth.ctx!.userId)
  if (!u) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  const effectiveRole = (u.isSuperAdmin || (u.adminUntil && u.adminUntil > new Date())) ? 'admin' : u.role
  return NextResponse.json({
    success: true,
    user: {
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: effectiveRole,
      department: u.department,
      employeeId: u.employeeId,
      phone: u.phone,
      status: u.status,
      isSuperAdmin: u.isSuperAdmin,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
      adminUntil: u.adminUntil,
    }
  })
}


