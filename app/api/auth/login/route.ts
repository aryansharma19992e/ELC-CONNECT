import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { signToken, verifyPassword } from '@/lib/auth'
import { authRateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(['student', 'faculty', 'admin']).optional()
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

    if (validatedData.role && user.role !== validatedData.role) {
      return NextResponse.json({ error: 'Role mismatch' }, { status: 403 })
    }

    const token = signToken({ sub: user._id.toString(), role: user.role })

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        studentId: user.studentId,
        status: user.status,
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
