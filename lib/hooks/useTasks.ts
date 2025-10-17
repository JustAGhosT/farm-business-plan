import { useCrudApi } from './useCrudApi'

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
 * 
 * Refactored to use generic useCrudApi hook for consistent behavior and timeout handling
 */
export function useTasks(filters?: TaskFilters): UseTasksResult {
  const { items, loading, error, refetch, create, update, remove } = useCrudApi<Task>({
    endpoint: '/api/tasks',
    filters,
    timeout: 30000,
  })

  return {
    tasks: items,
    loading,
    error,
    refetch,
    createTask: create,
    updateTask: update,
    deleteTask: remove,
  }
}
