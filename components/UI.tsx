'use client'

import { ActionCard, Card, InfoCard, MetricCard } from '@/components/Card'
import { ErrorMessage, SuccessMessage } from '@/lib/error-handling'
import React from 'react'

// Common UI patterns and layouts
export interface PageLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export function PageLayout({
  title,
  subtitle,
  children,
  actions,
  className = '',
}: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 ${className}`}
    >
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{title}</h1>
              {subtitle && <p className="text-gray-600 dark:text-gray-300">{subtitle}</p>}
            </div>
            {actions && <div className="flex gap-3">{actions}</div>}
          </div>
        </div>
        {children}
      </main>
    </div>
  )
}

// Loading states
export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className = '',
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={`text-center py-12 ${className}`} role="status">
      <div
        className={`inline-block animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}
        aria-hidden="true"
      ></div>
      <p className="mt-4 text-gray-600 dark:text-gray-300" aria-live="polite">{message}</p>
    </div>
  )
}

// Empty states
export interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
      {action}
    </div>
  )
}

// Form sections
export interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({ title, description, children, className = '' }: FormSectionProps) {
  return (
    <Card className={`mb-8 ${className}`}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
        {description && <p className="text-gray-600 dark:text-gray-300">{description}</p>}
      </div>
      {children}
    </Card>
  )
}

// Results display
export interface ResultsDisplayProps {
  title: string
  results: any
  children: React.ReactNode
  className?: string
}

export function ResultsDisplay({ title, results, children, className = '' }: ResultsDisplayProps) {
  if (!results) return null

  return (
    <Card className={`mb-8 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{title}</h3>
      {children}
    </Card>
  )
}

// Action buttons
export interface ActionButtonsProps {
  onBack?: () => void
  onNext?: () => void
  onSave?: () => void
  onCancel?: () => void
  backLabel?: string
  nextLabel?: string
  saveLabel?: string
  cancelLabel?: string
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function ActionButtons({
  onBack,
  onNext,
  onSave,
  onCancel,
  backLabel = 'Back',
  nextLabel = 'Next',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
  className = '',
}: ActionButtonsProps) {
  return (
    <div className={`flex justify-between ${className}`}>
      <div className="flex gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={loading || disabled}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {backLabel}
          </button>
        )}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading || disabled}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </button>
        )}
      </div>

      <div className="flex gap-3">
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={loading || disabled}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : saveLabel}
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={loading || disabled}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : nextLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// Status indicators
export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'loading'
  message: string
  className?: string
}

export function StatusIndicator({ status, message, className = '' }: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-700',
      textColor: 'text-green-800 dark:text-green-200',
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-700',
      textColor: 'text-yellow-800 dark:text-yellow-200',
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-700',
      textColor: 'text-red-800 dark:text-red-200',
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-700',
      textColor: 'text-blue-800 dark:text-blue-200',
    },
    loading: {
      icon: '⏳',
      bgColor: 'bg-gray-50 dark:bg-gray-900/20',
      borderColor: 'border-gray-200 dark:border-gray-700',
      textColor: 'text-gray-800 dark:text-gray-200',
    },
  }

  const config = statusConfig[status]

  return (
    <div
      className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor} ${config.textColor} ${className}`}
    >
      <div className="flex items-center">
        <span className="text-lg mr-3">{config.icon}</span>
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}

// Data grid
export interface DataGridProps {
  data: any[]
  columns: Array<{
    key: string
    label: string
    render?: (value: any, row: any) => React.ReactNode
  }>
  className?: string
}

export function DataGrid({ data, columns, className = '' }: DataGridProps) {
  if (data.length === 0) {
    return <EmptyState icon="📊" title="No Data" description="No data available to display" />
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                >
                  {column.render ? column.render(row[column.key], row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Export all components
export {
  ActionButtons, ActionCard, Card, DataGrid, EmptyState, ErrorMessage, FormSection, InfoCard, LoadingState, MetricCard, PageLayout, ResultsDisplay, StatusIndicator, SuccessMessage
}

