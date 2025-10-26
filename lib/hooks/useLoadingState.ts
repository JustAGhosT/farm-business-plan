// Shared loading state hook to eliminate duplication across components
import { useCallback, useState } from 'react'

export interface LoadingState {
  loading: boolean
  error: string | null
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  executeWithLoading: <T>(asyncFn: () => Promise<T>) => Promise<T | null>
}

export function useLoadingState(initialLoading = false): LoadingState {
  const [loading, setLoading] = useState(initialLoading)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const executeWithLoading = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    setLoading,
    setError,
    clearError,
    executeWithLoading
  }
}

// Convenience hook for async operations with automatic loading states
export function useAsyncOperation<T = any>() {
  const { loading, error, executeWithLoading } = useLoadingState()

  const execute = useCallback(async (
    operation: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithLoading(operation)
  }, [executeWithLoading])

  return {
    loading,
    error,
    execute
  }
}

// Hook for form submissions with loading states
export function useFormSubmission() {
  const { loading, error, executeWithLoading } = useLoadingState()

  const submit = useCallback(async (
    submitFn: () => Promise<any>
  ): Promise<boolean> => {
    const result = await executeWithLoading(submitFn)
    return result !== null
  }, [executeWithLoading])

  return {
    loading,
    error,
    submit
  }
}

// Hook for data fetching with loading states
export function useDataFetching<T = any>() {
  const { loading, error, executeWithLoading } = useLoadingState(true)

  const fetch = useCallback(async (
    fetchFn: () => Promise<T>
  ): Promise<T | null> => {
    return executeWithLoading(fetchFn)
  }, [executeWithLoading])

  return {
    loading,
    error,
    fetch
  }
}
