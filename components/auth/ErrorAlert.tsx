import React from 'react'

interface ErrorAlertProps {
  message: string | null
  variant?: 'error' | 'success' | 'info'
}

export function ErrorAlert({ message, variant = 'error' }: ErrorAlertProps) {
  if (!message) return null

  const variantClasses = {
    error:
      'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
    success:
      'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400',
  }

  return (
    <div className={`mb-6 border rounded-lg p-4 ${variantClasses[variant]}`}>
      <p className="text-sm flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {message}
      </p>
    </div>
  )
}
