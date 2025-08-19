import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { connectToDatabase } from './db'
import { User } from './models/User'

export interface AuthContext {
  userId: string
  role: 'faculty' | 'admin'
}

export function getAuthContext(request: NextRequest): AuthContext | null {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  const payload = verifyToken(token) as any
  if (!payload || !payload.sub || !payload.role) return null
  return { userId: String(payload.sub), role: payload.role }
}

export function requireAuth(request: NextRequest): { ctx?: AuthContext; error?: NextResponse } {
  const ctx = getAuthContext(request)
  if (!ctx) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  return { ctx }
}

export function requireRole(request: NextRequest, allowed: Array<AuthContext['role']>): { ctx?: AuthContext; error?: NextResponse } {
  const result = requireAuth(request)
  if (result.error) return result
  const ctx = result.ctx!
  const role = ctx.role
  // Allow temporary admin if within adminUntil window
  if (!allowed.includes(role)) {
    if (allowed.includes('admin')) {
      // Check DB for temporary admin
      // Note: this call is sync-like, but Next route handlers can await outside. For simplicity, deny here; callers can use requireAdmin helper instead for async.
      return {
        error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  return result
}

// Async helper for admin check that supports time-bound admin
export async function requireAdmin(request: NextRequest): Promise<{ ctx?: AuthContext; error?: NextResponse }> {
  const result = requireAuth(request)
  if (result.error) return result
  const ctx = result.ctx!
  if (ctx.role === 'admin') return result
  await connectToDatabase()
  const u = await User.findById(ctx.userId)
  if (u && (u.isSuperAdmin || (u.adminUntil && u.adminUntil > new Date()))) return result
  return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
}

// Require super admin only
export async function requireSuperAdmin(request: NextRequest): Promise<{ ctx?: AuthContext; error?: NextResponse }> {
  const result = requireAuth(request)
  if (result.error) return result
  await connectToDatabase()
  const u = await User.findById(result.ctx!.userId)
  const superEmail = process.env.SUPERADMIN_EMAIL
  if (u && u.isSuperAdmin && (!superEmail || u.email === superEmail)) return result
  return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
}


