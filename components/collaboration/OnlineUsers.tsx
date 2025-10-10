'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface OnlineUser {
  id: string
  user_id: string
  user_name: string
  user_email: string
  farm_plan_id?: string
  current_section?: string
  action: 'viewing' | 'editing' | 'commenting'
  last_activity: string
  session_id: string
}

interface OnlineUsersProps {
  farmPlanId?: string
  refreshInterval?: number
}

export default function OnlineUsers({ farmPlanId, refreshInterval = 10000 }: OnlineUsersProps) {
  const { data: session } = useSession()
  const [users, setUsers] = useState<OnlineUser[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionId] = useState(() => Math.random().toString(36).substring(7))

  useEffect(() => {
    if (!session?.user) return

    // Send heartbeat to mark user as online
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/online-users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            farm_plan_id: farmPlanId,
            current_section: window.location.pathname,
            action: 'viewing',
            session_id: sessionId
          })
        })
      } catch (err) {
        console.error('Failed to send heartbeat:', err)
      }
    }

    // Fetch online users
    const fetchOnlineUsers = async () => {
      try {
        const params = new URLSearchParams()
        if (farmPlanId) params.append('farm_plan_id', farmPlanId)

        const response = await fetch(`/api/online-users?${params}`)
        const data = await response.json()

        if (data.success) {
          // Filter out current user
          setUsers(data.data.filter((u: OnlineUser) => u.user_id !== session.user.id))
        }
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch online users:', err)
        setLoading(false)
      }
    }

    // Initial heartbeat and fetch
    sendHeartbeat()
    fetchOnlineUsers()

    // Set up intervals
    const heartbeatInterval = setInterval(sendHeartbeat, 30000) // Every 30 seconds
    const fetchInterval = setInterval(fetchOnlineUsers, refreshInterval)

    // Cleanup on unmount
    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(fetchInterval)
      
      // Remove user from online status
      fetch(`/api/online-users?session_id=${sessionId}`, {
        method: 'DELETE'
      }).catch(console.error)
    }
  }, [session, farmPlanId, sessionId, refreshInterval])

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'editing':
        return '✏️'
      case 'commenting':
        return '💬'
      default:
        return '👁️'
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'editing':
        return 'text-blue-600 dark:text-blue-400'
      case 'commenting':
        return 'text-purple-600 dark:text-purple-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Online Now
        </h3>
        <div className="text-xs text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        Online Now
        {users.length > 0 && (
          <span className="ml-auto text-xs font-normal text-gray-500 dark:text-gray-400">
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </span>
        )}
      </h3>
      
      {users.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No other users online
        </p>
      ) : (
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-start gap-2 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium text-sm">
                {user.user_name?.charAt(0)?.toUpperCase() || user.user_email?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.user_name || user.user_email}
                  </p>
                  <span className={`text-xs ${getActionColor(user.action)}`}>
                    {getActionIcon(user.action)}
                  </span>
                </div>
                {user.current_section && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.current_section}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
