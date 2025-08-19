import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { signToken, verifyPassword } from '@/lib/auth'
import { authRateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const limited = authRateLimit(request)
    if (limited) return limited
    const body = await request.json()
    const validatedData = loginSchema.parse(body)

    await connectToDatabase()

    const user = await User.findOne({ email: validatedData.email })
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const ok = await verifyPassword(validatedData.password, user.password)
    if (!ok) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // No role selection; only faculty coordinators and admins exist in system

    // Elevate to admin if within temporary admin window
    let effectiveRole = user.role
    if (user.adminUntil && user.adminUntil > new Date()) {
      effectiveRole = 'admin'
    }
    if (user.isSuperAdmin) {
      effectiveRole = 'admin'
    }
    const token = signToken({ sub: user._id.toString(), role: effectiveRole })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: effectiveRole,
        department: user.department,
        employeeId: user.employeeId,
        phone: user.phone,
        status: user.status,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt
      },
      token
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
