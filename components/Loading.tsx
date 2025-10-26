'use client'

import React from 'react'

// Loading spinner variants
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

export interface SpinnerProps {
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
}

// Size configurations
const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12'
}

// Color configurations
const variantClasses = {
  primary: 'border-primary-600',
  secondary: 'border-gray-600 dark:border-gray-400',
  success: 'border-green-600',
  warning: 'border-yellow-600',
  error: 'border-red-600',
  info: 'border-blue-600'
}

// Base spinner component
export function Spinner({
  size = 'md',
  variant = 'primary',
  className = ''
}: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-transparent ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Loading state component with message
export interface LoadingStateProps {
  message?: string
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
  showMessage?: boolean
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  variant = 'primary',
  className = '',
  showMessage = true
}: LoadingStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex items-center justify-center">
        <Spinner size={size} variant={variant} />
        {showMessage && (
          <span className="ml-3 text-gray-600 dark:text-gray-300">
            {message}
          </span>
        )}
      </div>
    </div>
  )
}

// Inline loading component
export interface InlineLoadingProps {
  message?: string
  size?: SpinnerSize
  variant?: SpinnerVariant
  className?: string
}

export function InlineLoading({
  message = 'Loading...',
  size = 'sm',
  variant = 'primary',
  className = ''
}: InlineLoadingProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Spinner size={size} variant={variant} />
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
        {message}
      </span>
    </div>
  )
}

// Button loading state
export interface ButtonLoadingProps {
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export function ButtonLoading({
  loading = false,
  children,
  className = ''
}: ButtonLoadingProps) {
  return (
    <div className={`flex items-center ${className}`}>
      {loading && (
        <Spinner size="sm" variant="secondary" className="mr-2" />
      )}
      {children}
    </div>
  )
}

// Page loading overlay
export interface LoadingOverlayProps {
  loading?: boolean
  message?: string
  children: React.ReactNode
  className?: string
}

export function LoadingOverlay({
  loading = false,
  message = 'Loading...',
  children,
  className = ''
}: LoadingOverlayProps) {
  if (!loading) return <>{children}</>

  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
        <div className="text-center">
          <Spinner size="lg" variant="primary" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
      </div>
    </div>
  )
}

// Skeleton loading components
export interface SkeletonProps {
  className?: string
  height?: string
  width?: string
  rounded?: boolean
}

export function Skeleton({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = true
}: SkeletonProps) {
  const roundedClass = rounded ? 'rounded' : ''
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 ${height} ${width} ${roundedClass} ${className}`}
    />
  )
}

// Text skeleton
export function SkeletonText({
  lines = 1,
  className = ''
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="h-4"
          width={index === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  )
}

// Card skeleton
export function SkeletonCard({
  className = ''
}: {
  className?: string
}) {
  return (
    <div className={`p-6 border border-gray-200 dark:border-gray-700 rounded-lg ${className}`}>
      <div className="space-y-4">
        <Skeleton height="h-6" width="w-1/3" />
        <SkeletonText lines={3} />
        <div className="flex space-x-2">
          <Skeleton height="h-8" width="w-20" />
          <Skeleton height="h-8" width="w-20" />
        </div>
      </div>
    </div>
  )
}

// Table skeleton
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className = ''
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {Array.from({ length: columns }).map((_, index) => (
              <th key={index} className="px-6 py-3">
                <Skeleton height="h-4" width="w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4">
                  <Skeleton height="h-4" width="w-16" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Loading states for specific use cases
export function DataLoadingState({
  message = 'Loading data...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <LoadingState
      message={message}
      size="lg"
      variant="primary"
      className={className}
    />
  )
}

export function FormLoadingState({
  message = 'Saving...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <LoadingState
      message={message}
      size="md"
      variant="primary"
      className={className}
    />
  )
}

export function ActionLoadingState({
  message = 'Processing...',
  className = ''
}: {
  message?: string
  className?: string
}) {
  return (
    <InlineLoading
      message={message}
      size="sm"
      variant="primary"
      className={className}
    />
  )
}
