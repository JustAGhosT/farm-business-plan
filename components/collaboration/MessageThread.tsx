'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

interface Message {
  id: string
  thread_id: string
  sender_id: string
  sender_name: string
  sender_email: string
  content: string
  context_type?: string
  context_id?: string
  context_section?: string
  parent_message_id?: string
  created_at: string
  updated_at: string
  edited_at?: string
  is_deleted: boolean
  mention_count: number
  attachment_count: number
  reply_count: number
}

interface MessageThreadProps {
  threadId?: string
  contextType?: string
  contextId?: string
  onNewMessage?: (message: Message) => void
}

export default function MessageThread({ threadId, contextType, contextId, onNewMessage }: MessageThreadProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    if (!session?.user) return

    const fetchMessages = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (threadId) params.append('thread_id', threadId)
        if (contextType) params.append('context_type', contextType)
        if (contextId) params.append('context_id', contextId)

        const response = await fetch(`/api/messages?${params}`)
        const data = await response.json()

        if (data.success) {
          setMessages(data.data)
          if (onNewMessage && data.data.length > 0) {
            onNewMessage(data.data[data.data.length - 1])
          }
        } else {
          setError(data.error || 'Failed to load messages')
        }
      } catch (err) {
        setError('Failed to load messages')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Poll for new messages every 10 seconds
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [session, threadId, contextType, contextId, onNewMessage])

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

  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
  }

  const handleDelete = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/messages?id=${messageId}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      if (data.success) {
        setMessages(prev => prev.filter(m => m.id !== messageId))
      } else {
        alert(data.error || 'Failed to delete message')
      }
    } catch (err) {
      console.error('Failed to delete message:', err)
      alert('Failed to delete message')
    }
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-red-600 dark:text-red-400 text-center py-4">
          {error}
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="text-gray-600 dark:text-gray-400 text-center py-4">
          Please sign in to view messages
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Conversation
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </p>
      </div>

      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === session.user.id
            const isReply = !!message.parent_message_id

            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} ${isReply ? 'ml-8' : ''}`}
              >
                <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {!isOwnMessage && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 text-xs font-medium">
                        {message.sender_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {message.sender_name || message.sender_email}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`rounded-lg p-3 ${
                      isOwnMessage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    
                    {message.edited_at && (
                      <p className="text-xs mt-1 opacity-75">(edited)</p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
                      <span>{formatTimestamp(message.created_at)}</span>
                      {message.mention_count > 0 && (
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                          {message.mention_count}
                        </span>
                      )}
                      {message.reply_count > 0 && (
                        <span className="inline-flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                          </svg>
                          {message.reply_count}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleReply(message.id)}
                      className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Reply
                    </button>
                    {isOwnMessage && (
                      <button
                        onClick={() => handleDelete(message.id)}
                        className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {replyingTo && (
        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              Replying to message
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
