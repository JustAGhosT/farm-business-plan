// Shared error handling utilities for consistent error management across the application
import { useCallback, useState } from 'react'

export interface ErrorState {
  error: string | null
  setError: (error: string | null) => void
  clearError: () => void
  handleError: (error: unknown) => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

// Error types for better error categorization
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN'
}

export interface CategorizedError {
  type: ErrorType
  message: string
  originalError?: unknown
  timestamp: Date
}

// Error categorization utility
export function categorizeError(error: unknown): CategorizedError {
  const timestamp = new Date()
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Network connection error. Please check your internet connection.',
        originalError: error,
        timestamp
      }
    }
    
    if (message.includes('unauthorized') || message.includes('401')) {
      return {
        type: ErrorType.AUTHENTICATION,
        message: 'Authentication required. Please sign in again.',
        originalError: error,
        timestamp
      }
    }
    
    if (message.includes('forbidden') || message.includes('403')) {
      return {
        type: ErrorType.AUTHORIZATION,
        message: 'You do not have permission to perform this action.',
        originalError: error,
        timestamp
      }
    }
    
    if (message.includes('not found') || message.includes('404')) {
      return {
        type: ErrorType.NOT_FOUND,
        message: 'The requested resource was not found.',
        originalError: error,
        timestamp
      }
    }
    
    if (message.includes('server') || message.includes('500')) {
      return {
        type: ErrorType.SERVER,
        message: 'Server error occurred. Please try again later.',
        originalError: error,
        timestamp
      }
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: error.message || 'An unexpected error occurred',
      originalError: error,
      timestamp
    }
  }
  
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      originalError: error,
      timestamp
    }
  }
  
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unexpected error occurred',
    originalError: error,
    timestamp
  }
}

// Hook for error state management
export function useErrorState(): ErrorState {
  const [error, setError] = useState<string | null>(null)
  
  const clearError = useCallback(() => {
    setError(null)
  }, [])
  
  const handleError = useCallback((error: unknown) => {
    const categorizedError = categorizeError(error)
    setError(categorizedError.message)
    
    // Log error for debugging
    console.error('Error handled:', categorizedError)
  }, [])
  
  return {
    error,
    setError,
    clearError,
    handleError
  }
}

// Error message component props
export interface ErrorMessageProps {
  error: string | null
  onDismiss?: () => void
  variant?: 'error' | 'warning' | 'info'
  className?: string
}

// Error message component
export function ErrorMessage({ 
  error, 
  onDismiss, 
  variant = 'error',
  className = '' 
}: ErrorMessageProps) {
  if (!error) return null
  
  const variantStyles = {
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200'
  }
  
  const iconStyles = {
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400'
  }
  
  const icons = {
    error: '⚠️',
    warning: '⚠️',
    info: 'ℹ️'
  }
  
  return (
    <div className={`p-4 rounded-lg border ${variantStyles[variant]} ${className}`}>
      <div className="flex items-start">
        <span className={`text-lg mr-3 ${iconStyles[variant]}`}>
          {icons[variant]}
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{error}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`ml-3 text-lg ${iconStyles[variant]} hover:opacity-70`}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// Success message component
export interface SuccessMessageProps {
  message: string | null
  onDismiss?: () => void
  className?: string
}

export function SuccessMessage({ 
  message, 
  onDismiss, 
  className = '' 
}: SuccessMessageProps) {
  if (!message) return null
  
  return (
    <div className={`p-4 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 ${className}`}>
      <div className="flex items-start">
        <span className="text-lg mr-3 text-green-600 dark:text-green-400">
          ✅
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-lg text-green-600 dark:text-green-400 hover:opacity-70"
            aria-label="Dismiss success message"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}

// Async error handler wrapper
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  errorHandler?: (error: unknown) => void
) {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args)
    } catch (error) {
      const categorizedError = categorizeError(error)
      
      if (errorHandler) {
        errorHandler(categorizedError.message)
      } else {
        console.error('Unhandled error:', categorizedError)
      }
      
      return null
    }
  }
}

// Error boundary hook for functional components
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null)
  
  const resetError = useCallback(() => {
    setError(null)
  }, [])
  
  const captureError = useCallback((error: Error) => {
    setError(error)
  }, [])
  
  if (error) {
    throw error
  }
  
  return { captureError, resetError }
}

// Global error handler for unhandled errors
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      const categorizedError = categorizeError(event.error)
      console.error('Global error:', categorizedError)
      
      // You could send this to an error reporting service
      // errorReportingService.report(categorizedError)
    })
    
    window.addEventListener('unhandledrejection', (event) => {
      const categorizedError = categorizeError(event.reason)
      console.error('Unhandled promise rejection:', categorizedError)
      
      // You could send this to an error reporting service
      // errorReportingService.report(categorizedError)
    })
  }
}

// Error reporting service interface (for future implementation)
export interface ErrorReportingService {
  report(error: CategorizedError): void
  setUser(user: { id: string; email?: string }): void
  clearUser(): void
}

// Mock error reporting service
export const errorReportingService: ErrorReportingService = {
  report: (error: CategorizedError) => {
    console.log('Error reported:', error)
    // In a real implementation, this would send to Sentry, LogRocket, etc.
  },
  
  setUser: (user: { id: string; email?: string }) => {
    console.log('Error reporting user set:', user)
  },
  
  clearUser: () => {
    console.log('Error reporting user cleared')
  }
}
