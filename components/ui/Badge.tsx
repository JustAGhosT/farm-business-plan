import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'public' | 'locked' | 'success' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'info', size = 'sm', className = '' }: BadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
  }

  const variantClasses = {
    public: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    locked: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    success: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  }

  return (
    <span className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full ${className}`}>
      {children}
    </span>
  )
}
