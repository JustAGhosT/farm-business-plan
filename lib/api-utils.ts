import { NextResponse } from 'next/server'

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Standardized API error response
 */
export interface ApiError {
  success: false
  error: string
  details?: any
  code?: string
  requestId?: string
  timestamp?: string
}

/**
 * Standardized API success response
 */
export interface ApiSuccess<T = any> {
  success: true
  data?: T
  message?: string
  count?: number
  requestId?: string
}

/**
 * Centralized error handler for API routes
 * Wraps API route handlers with consistent error handling
 */
export function withErrorHandler<T = any>(
  handler: (request: Request) => Promise<NextResponse<ApiSuccess<T> | ApiError>>
) {
  return async (request: Request): Promise<NextResponse<ApiSuccess<T> | ApiError>> => {
    const requestId = generateRequestId()
    
    try {
      const response = await handler(request)
      
      // Add requestId to successful responses
      if (response.headers.get('content-type')?.includes('application/json')) {
        const body = await response.json()
        return NextResponse.json(
          { ...body, requestId },
          { status: response.status }
        )
      }
      
      return response
    } catch (error) {
      console.error(`API route error [${requestId}]:`, error)
      
      // Handle specific error types
      if (error instanceof Error) {
        return NextResponse.json(
          {
            success: false,
            error: error.message || 'Internal server error',
            code: 'INTERNAL_ERROR',
            requestId,
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        )
      }

      // Generic error fallback
      return NextResponse.json(
        {
          success: false,
          error: 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR',
          requestId,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      )
    }
  }
}

/**
 * Create a standardized error response with enhanced context
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
      requestId: generateRequestId(),
      timestamp: new Date().toISOString(),
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
      requestId: generateRequestId(),
    },
    { status }
  )
}
