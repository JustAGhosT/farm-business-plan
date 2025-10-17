import { NextResponse } from 'next/server'

/**
 * Standardized API error response
 */
export interface ApiError {
  success: false
  error: string
  details?: any
  code?: string
}

/**
 * Standardized API success response
 */
export interface ApiSuccess<T = any> {
  success: true
  data?: T
  message?: string
  count?: number
}

/**
 * Centralized error handler for API routes
 * Wraps API route handlers with consistent error handling
 */
export function withErrorHandler<T = any>(
  handler: (request: Request) => Promise<NextResponse<ApiSuccess<T> | ApiError>>
) {
  return async (request: Request): Promise<NextResponse<ApiSuccess<T> | ApiError>> => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('API route error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Internal server error',
          },
          { status: 500 }
        )
      }

      // Generic error fallback
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred',
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  details?: any,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error,
      ...(details && { details }),
      ...(code && { code }),
    },
    { status }
  )
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = any>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      ...(data !== undefined && { data }),
      ...(message && { message }),
    },
    { status }
  )
}
