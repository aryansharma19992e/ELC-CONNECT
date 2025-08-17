import { NextResponse } from 'next/server'
import { z } from 'zod'
import mongoose from 'mongoose'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

export class CustomError extends Error implements AppError {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends CustomError {
  constructor(message: string) {
    super(message, 400)
  }
}

export class AuthenticationError extends CustomError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
  }
}

export class AuthorizationError extends CustomError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
  }
}

export class NotFoundError extends CustomError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
  }
}

export class ConflictError extends CustomError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409)
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation error',
        details: error.errors,
        message: 'Invalid input data'
      },
      { status: 400 }
    )
  }

  // Handle Mongoose validation errors
  if (error instanceof mongoose.Error.ValidationError) {
    const validationErrors = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message
    }))
    
    return NextResponse.json(
      {
        error: 'Validation error',
        details: validationErrors,
        message: 'Data validation failed'
      },
      { status: 400 }
    )
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return NextResponse.json(
      {
        error: 'Duplicate key error',
        message: `${field} already exists`,
        field
      },
      { status: 409 }
    )
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      {
        error: 'Invalid ID format',
        message: 'The provided ID is not valid'
      },
      { status: 400 }
    )
  }

  // Handle custom application errors
  if (error instanceof CustomError) {
    return NextResponse.json(
      {
        error: error.constructor.name,
        message: error.message
      },
      { status: error.statusCode }
    )
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return NextResponse.json(
      {
        error: 'Invalid token',
        message: 'The authentication token is invalid'
      },
      { status: 401 }
    )
  }

  if (error.name === 'TokenExpiredError') {
    return NextResponse.json(
      {
        error: 'Token expired',
        message: 'The authentication token has expired'
      },
      { status: 401 }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    },
    { status: 500 }
  )
}

export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error
    }
  }
}

export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      console.error('Function error:', error)
      throw error
    }
  }
}
