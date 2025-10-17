import { useCrudApi } from './useCrudApi'

export interface WizardSession {
  id: string
  user_id: string
  session_name: string
  years: number
  crops: any[]
  total_percentage: number
  current_step: number
  step_data: Record<string, any>
  completed_steps: number[]
  is_completed: boolean
  created_at: string
  updated_at: string
}

interface UseWizardSessionsResult {
  sessions: WizardSession[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createSession: (data: Partial<WizardSession>) => Promise<WizardSession | null>
  updateSession: (id: string, data: Partial<WizardSession>) => Promise<WizardSession | null>
  deleteSession: (id: string) => Promise<boolean>
}

/**
 * Custom hook for managing wizard sessions
 * Provides CRUD operations and automatic data fetching
 * 
 * Refactored to use generic useCrudApi hook for consistent behavior and timeout handling
 */
export function useWizardSessions(): UseWizardSessionsResult {
  const { items, loading, error, refetch, create, remove } = useCrudApi<WizardSession>({
    endpoint: '/api/wizard-sessions',
    timeout: 30000,
    updateMethod: 'PUT', // Wizard sessions use PUT
  })

  // Custom update that maps to PUT method
  const updateSession = async (id: string, data: Partial<WizardSession>) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch('/api/wizard-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
        signal: controller.signal,
      })

      const result = await response.json()

      if (result.session) {
        await refetch() // Refresh the list
        return result.session
      } else {
        return null
      }
    } catch (err) {
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return {
    sessions: items,
    loading,
    error,
    refetch,
    createSession: create,
    updateSession,
    deleteSession: remove,
  }
}
