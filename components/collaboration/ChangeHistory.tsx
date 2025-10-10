'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface ChangeLogEntry {
  id: string
  target_type: string
  target_id: string
  user_name: string
  user_email: string
  action: string
  description: string
  field?: string
  old_value?: string
  new_value?: string
  timestamp: string
}

interface ChangeHistoryProps {
  targetType?: string
  targetId?: string
  limit?: number
}

export default function ChangeHistory({ targetType, targetId, limit = 20 }: ChangeHistoryProps) {
  const { data: session } = useSession()
  const [changes, setChanges] = useState<ChangeLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return

    const fetchChanges = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (targetType) params.append('target_type', targetType)
        if (targetId) params.append('target_id', targetId)
        params.append('limit', limit.toString())

        const response = await fetch(`/api/change-log?${params}`)
        const data = await response.json()

        if (data.success) {
          setChanges(data.data)
        } else {
          setError(data.error || 'Failed to load change history')
        }
      } catch (err) {
        setError('Failed to load change history')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchChanges()
  }, [session, targetType, targetId, limit])

  const getActionBadge = (action: string) => {
    const styles = {
      created: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      updated: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      deleted: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      approved: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      rejected: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
    }
    return styles[action as keyof typeof styles] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Change History
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Change History
        </h3>
        <div className="text-red-600 dark:text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Change History
      </h3>
      
      {changes.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No changes recorded yet
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {changes.map((change) => (
            <div
              key={change.id}
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 py-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getActionBadge(change.action)}`}>
                      {change.action}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTimestamp(change.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white mb-1">
                    {change.description}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    by {change.user_name || change.user_email}
                  </p>
                  {change.field && (change.old_value || change.new_value) && (
                    <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      <span className="font-medium">{change.field}:</span>
                      {change.old_value && (
                        <div className="text-red-600 dark:text-red-400">
                          - {change.old_value}
                        </div>
                      )}
                      {change.new_value && (
                        <div className="text-green-600 dark:text-green-400">
                          + {change.new_value}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
