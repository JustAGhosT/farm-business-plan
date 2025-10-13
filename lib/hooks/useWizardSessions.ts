import { useState, useEffect } from 'react'

export interface WizardSession {
  id: number
  session_name: string
  years: number
  crops: Array<{
    id: string
    name: string
    percentage: number
  }>
  total_percentage: number
  current_step: number
  step_data: Record<string, any>
  completed_steps: number[]
  is_completed: boolean
  created_at: string
  updated_at: string
}

export function useWizardSessions() {
  const [sessions, setSessions] = useState<WizardSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/wizard-sessions')

      if (!response.ok) {
        throw new Error('Failed to fetch sessions')
      }

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching wizard sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create a new session
  const createSession = async (sessionData: {
    session_name: string
    years: number
    crops: any[]
    total_percentage: number
    current_step?: number
    step_data?: Record<string, any>
  }) => {
    try {
      const response = await fetch('/api/wizard-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData),
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()
      await fetchSessions() // Refresh the list
      return data.session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error creating wizard session:', err)
      throw err
    }
  }

  // Update an existing session
  const updateSession = async (
    id: number,
    updates: Partial<Omit<WizardSession, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const response = await fetch('/api/wizard-sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })

      if (!response.ok) {
        throw new Error('Failed to update session')
      }

      const data = await response.json()
      await fetchSessions() // Refresh the list
      return data.session
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error updating wizard session:', err)
      throw err
    }
  }

  // Delete a session
  const deleteSession = async (id: number) => {
    try {
      const response = await fetch(`/api/wizard-sessions?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete session')
      }

      await fetchSessions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error deleting wizard session:', err)
      throw err
    }
  }

  // Auto-fetch sessions on mount
  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    sessions,
    loading,
    error,
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
  }
}
