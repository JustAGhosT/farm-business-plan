'use client'

import { useState } from 'react'
import MessageThread from './MessageThread'
import MessageInput from './MessageInput'

interface MessagingPanelProps {
  threadId?: string
  contextType?: string
  contextId?: string
  contextSection?: string
  title?: string
  className?: string
}

export default function MessagingPanel({
  threadId,
  contextType,
  contextId,
  contextSection,
  title = 'Messages',
  className = ''
}: MessagingPanelProps) {
  const [key, setKey] = useState(0)

  const handleMessageSent = () => {
    // Force refresh of message thread
    setKey(prev => prev + 1)
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className="flex-1 overflow-hidden">
        <MessageThread
          key={key}
          threadId={threadId}
          contextType={contextType}
          contextId={contextId}
        />
      </div>

      <div className="flex-shrink-0 p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <MessageInput
          threadId={threadId}
          contextType={contextType}
          contextId={contextId}
          contextSection={contextSection}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  )
}
