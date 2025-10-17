import { useState, useEffect, useCallback } from 'react'

export interface Task {
  id: string
  farm_plan_id: string
  crop_plan_id?: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  due_date?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

interface UseTasksResult {
  tasks: Task[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createTask: (data: Partial<Task>) => Promise<Task | null>
  updateTask: (id: string, data: Partial<Task>) => Promise<Task | null>
  deleteTask: (id: string) => Promise<boolean>
}

interface TaskFilters {
  farm_plan_id?: string
  status?: string
  priority?: string
}

/**
 * Custom hook for managing tasks
 * Provides CRUD operations and automatic data fetching with filtering
 */
export function useTasks(filters?: TaskFilters): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.farm_plan_id) params.append('farm_plan_id', filters.farm_plan_id)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)

      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url, { signal: controller.signal })
      const result = await response.json()

      if (result.success) {
        setTasks(result.data)
      } else {
        setError(result.error || 'Failed to fetch tasks')
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
  }, [filters?.farm_plan_id, filters?.status, filters?.priority])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(
    async (data: Partial<Task>) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await fetchTasks() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to create task')
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
    [fetchTasks]
  )

  const updateTask = useCallback(
    async (id: string, data: Partial<Task>) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch('/api/tasks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, ...data }),
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await fetchTasks() // Refresh the list
          return result.data
        } else {
          setError(result.error || 'Failed to update task')
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
    [fetchTasks]
  )

  const deleteTask = useCallback(
    async (id: string) => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000)

      try {
        const response = await fetch(`/api/tasks?id=${id}`, {
          method: 'DELETE',
          signal: controller.signal,
        })

        const result = await response.json()

        if (result.success) {
          await fetchTasks() // Refresh the list
          return true
        } else {
          setError(result.error || 'Failed to delete task')
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
    [fetchTasks]
  )

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}
