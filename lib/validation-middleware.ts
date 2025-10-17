import { NextResponse } from 'next/server'
import { z } from 'zod'
import { validateData } from '@/lib/validation'
import { createErrorResponse } from '@/lib/api-utils'

/**
 * Higher-order function that wraps API handlers with automatic validation
 * Returns error response if validation fails, otherwise calls handler with validated data
 */
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (data: T, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      const body = await request.json()
      
      // Validate the data
      const validation = validateData(schema, body)
      
      if (!validation.success) {
        return createErrorResponse(
          'Validation failed',
          400,
          validation.errors?.issues,
          'VALIDATION_ERROR'
        )
      }

      // Call the handler with validated data
      return await handler(validation.data!, request)
    } catch (error) {
      if (error instanceof SyntaxError) {
        return createErrorResponse('Invalid JSON in request body', 400, undefined, 'INVALID_JSON')
      }
      throw error
    }
  }
}

/**
 * Validate query parameters against a schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): { success: boolean; data?: T; error?: string } {
  try {
    const params: any = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    
    const validation = validateData(schema, params)
    
    if (!validation.success) {
      return {
        success: false,
        error: 'Invalid query parameters',
      }
    }
    
    return {
      success: true,
      data: validation.data,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to validate query parameters',
    }
  }
}
