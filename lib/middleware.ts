import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    role: string
  }
}

export async function authenticateUser(request: NextRequest): Promise<NextResponse | null> {
  try {
    const authHeader = request.headers.get('authorization')
    const token = extractTokenFromHeader(authHeader)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token required' },
        { status: 401 }
      )
    }
    
    const decoded = verifyToken(token)
    
    // Add user info to request for use in route handlers
    ;(request as any).user = decoded
    
    return null // Continue to route handler
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    const authResult = await authenticateUser(request)
    if (authResult) return authResult
    
    const user = (request as any).user
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }
    
    return null
  }
}

export function requireAdmin() {
  return requireRole(['admin'])
}

export function requireFacultyOrAdmin() {
  return requireRole(['faculty', 'admin'])
}

export function requireStudent() {
  return requireRole(['student', 'faculty', 'admin'])
}
