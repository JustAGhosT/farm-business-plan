import { useState, useEffect, useCallback } from 'react'

export interface Task {
  id: string
  farm_plan_id: string
  crop_plan_id?: string
  title: string
  description?: string
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
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
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams()
      if (filters?.farm_plan_id) params.append('farm_plan_id', filters.farm_plan_id)
      if (filters?.status) params.append('status', filters.status)
      if (filters?.priority) params.append('priority', filters.priority)

      const url = `/api/tasks${params.toString() ? `?${params.toString()}` : ''}`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success) {
        setTasks(result.data)
      } else {
        setError(result.error || 'Failed to fetch tasks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [filters?.farm_plan_id, filters?.status, filters?.priority])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const createTask = useCallback(async (data: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
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
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchTasks])

  const updateTask = useCallback(async (id: string, data: Partial<Task>) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
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
      setError(err instanceof Error ? err.message : 'An error occurred')
      return null
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id: string) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
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
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask
  }
}
