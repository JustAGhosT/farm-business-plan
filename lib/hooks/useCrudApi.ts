import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebounce } from './useDebounce'

/**
 * Configuration for the generic CRUD API hook
 */
export interface CrudApiConfig<T> {
  endpoint: string
  filters?: Record<string, any>
  timeout?: number
  debounce?: number
  defaultMethod?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  updateMethod?: 'PATCH' | 'PUT'
  deleteMethod?: 'DELETE'
}

/**
 * Result type for the generic CRUD API hook
 */
export interface UseCrudApiResult<T> {
  items: T[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  create: (data: Partial<T>) => Promise<T | null>
  update: (id: string, data: Partial<T>) => Promise<T | null>
  remove: (id: string) => Promise<boolean>
  clearError: () => void
}

/**
 * Generic CRUD API hook
 * Provides standardized CRUD operations with consistent timeout handling and error management
 *
 * @example
 * ```typescript
 * const { items, loading, error, create, update, remove } = useCrudApi<Task>({
 *   endpoint: '/api/tasks',
 *   filters: { farm_plan_id: '123' },
 *   timeout: 30000
 * })
 * ```
 */
export function useCrudApi<T extends { id?: string }>(
  config: CrudApiConfig<T>
): UseCrudApiResult<T> {
  const {
    endpoint,
    filters,
    timeout = 30000,
    updateMethod = 'PATCH',
    deleteMethod = 'DELETE',
    debounce = 0,
  } = config

  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debouncedFilters = useDebounce(filters, debounce)

  // Memoize the filters to avoid unnecessary refetches
  const filterString = useMemo(() => JSON.stringify(debouncedFilters || {}), [debouncedFilters])

  const fetchItems = useCallback(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value))
          }
        })
      }

      const url = `${endpoint}${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url, { signal: controller.signal })
      const result = await response.json()

      if (result.success) {
        setItems(result.data || [])
      } else {
        setError(result.error || 'Failed to fetch data')
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.')
      } else {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
    }
  }, [endpoint, filterString, timeout])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const create = useCallback(
    async (data: Partial<T>) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await fetchItems() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to create item')
          return null
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timed out. Please try again.')
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
        return null
      } finally {
        clearTimeout(timeoutId)
      }
    },
    [endpoint, fetchItems, timeout]
  )

  const update = useCallback(
    async (id: string, data: Partial<T>) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        // Determine URL based on update method
        const url = updateMethod === 'PUT' ? `${endpoint}/${id}` : endpoint
        const body = updateMethod === 'PUT' ? data : { id, ...data }

        const response = await fetch(url, {
          method: updateMethod,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await fetchItems() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to update item')
          return null
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timed out. Please try again.')
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
        return null
      } finally {
        clearTimeout(timeoutId)
      }
    },
    [endpoint, fetchItems, timeout, updateMethod]
  )

  const remove = useCallback(
    async (id: string) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const url = `${endpoint}?id=${id}`
        const response = await fetch(url, {
          method: deleteMethod,
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await fetchItems() // Refresh the list
          return true
        } else {
          setError(result.error || 'Failed to delete item')
          return false
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Request timed out. Please try again.')
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
        return false
      } finally {
        clearTimeout(timeoutId)
      }
    },
    [endpoint, fetchItems, timeout, deleteMethod]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    create,
    update,
    remove,
    clearError,
  }
}
