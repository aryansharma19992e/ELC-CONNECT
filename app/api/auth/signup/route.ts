import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/db'
import { User } from '@/lib/models/User'
import { hashPassword } from '@/lib/auth'
import { authRateLimit } from '@/lib/rate-limit'

const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.literal('faculty').default('faculty'),
  department: z.string().min(1),
  employeeId: z.string().optional(),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const limited = authRateLimit(request)
    if (limited) return limited
    const body = await request.json()
    const validatedData = signupSchema.parse(body)

    await connectToDatabase()

    const existing = await User.findOne({ email: validatedData.email })
    if (existing) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 })
    }

    if (validatedData.role === 'faculty') {
      if (!validatedData.employeeId) {
        return NextResponse.json({ error: 'Employee ID is required for faculty accounts' }, { status: 400 })
      }
      const existingFaculty = await User.findOne({ employeeId: validatedData.employeeId })
      if (existingFaculty) {
        return NextResponse.json({ error: 'Employee ID already exists' }, { status: 409 })
      }
    }

    const passwordHash = await hashPassword(validatedData.password)
    const created = await User.create({
      email: validatedData.email,
      password: passwordHash,
      name: `${validatedData.firstName} ${validatedData.lastName}`.trim(),
      role: validatedData.role,
      department: validatedData.department,
      employeeId: validatedData.employeeId,
      phone: validatedData.phone,
      status: 'pending'
    })

    const user = {
      id: created._id.toString(),
      email: created.email,
      name: created.name,
      role: created.role,
      department: created.department,
      employeeId: created.employeeId,
      phone: created.phone,
      status: created.status,
      createdAt: created.createdAt
    }

    return NextResponse.json({ success: true, message: 'User registered successfully', user }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input data', details: error.errors }, { status: 400 })
    }
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
