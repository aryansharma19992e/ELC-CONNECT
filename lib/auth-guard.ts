import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'

export interface AuthContext {
  userId: string
  role: 'student' | 'faculty' | 'admin'
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
  if (!allowed.includes(result.ctx!.role)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }
  return result
}


