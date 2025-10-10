'use client'

import { useState, useRef, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface User {
  id: string
  name: string
  email: string
}

interface MessageInputProps {
  threadId?: string
  contextType?: string
  contextId?: string
  contextSection?: string
  parentMessageId?: string
  placeholder?: string
  onMessageSent?: (message: any) => void
  onCancel?: () => void
}

export default function MessageInput({
  threadId,
  contextType,
  contextId,
  contextSection,
  parentMessageId,
  placeholder = 'Type your message...',
  onMessageSent,
  onCancel,
}: MessageInputProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState('')
  const [mentionUsers, setMentionUsers] = useState<User[]>([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [content])

  // Detect @mentions
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBeforeCursor = content.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      const hasSpace = textAfterAt.includes(' ')

      if (!hasSpace) {
        setMentionSearch(textAfterAt)
        setShowMentions(true)
        setCursorPosition(lastAtIndex)
        // TODO: Fetch users matching search
        // For now, using mock data
        setMentionUsers(
          [
            { id: '1', name: 'John Farmer', email: 'john@farm.com' },
            { id: '2', name: 'Jane Agronomist', email: 'jane@farm.com' },
            { id: '3', name: 'Bob Manager', email: 'bob@farm.com' },
          ].filter(
            (u) =>
              u.name.toLowerCase().includes(textAfterAt.toLowerCase()) ||
              u.email.toLowerCase().includes(textAfterAt.toLowerCase())
          )
        )
        setSelectedMentionIndex(0)
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }, [content])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions && mentionUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev < mentionUsers.length - 1 ? prev + 1 : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedMentionIndex((prev) => (prev > 0 ? prev - 1 : mentionUsers.length - 1))
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(mentionUsers[selectedMentionIndex])
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setShowMentions(false)
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const insertMention = (user: User) => {
    const beforeMention = content.substring(0, cursorPosition)
    const afterCursor = content.substring(textareaRef.current?.selectionStart || 0)
    const newContent = `${beforeMention}@${user.name} ${afterCursor}`
    setContent(newContent)
    setShowMentions(false)

    // Set cursor position after mention
    setTimeout(() => {
      const newPos = cursorPosition + user.name.length + 2
      textareaRef.current?.setSelectionRange(newPos, newPos)
      textareaRef.current?.focus()
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() || sending) return
    if (!session?.user) {
      alert('Please sign in to send messages')
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: threadId,
          content: content.trim(),
          context_type: contextType,
          context_id: contextId,
          context_section: contextSection,
          parent_message_id: parentMessageId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setContent('')
        if (onMessageSent) {
          onMessageSent(data.data)
        }
      } else {
        alert(data.error || 'Failed to send message')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!session?.user) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center text-gray-600 dark:text-gray-400">
        Please sign in to send messages
      </div>
    )
  }

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700"
      >
        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full resize-none border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            rows={3}
            disabled={sending}
          />

          {showMentions && mentionUsers.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {mentionUsers.map((user, index) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => insertMention(user)}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    index === selectedMentionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{user.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 rounded-b-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Use @ to mention someone
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                disabled={sending}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() || sending}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
            >
              {sending ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
