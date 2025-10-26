'use client'

import React from 'react'
import { Button, LinkButton } from './Buttons'

// Empty state variants
export type EmptyStateVariant = 'default' | 'error' | 'warning' | 'info' | 'success'

export interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
  variant?: EmptyStateVariant
  className?: string
}

// Variant configurations
const variantClasses = {
  default: 'text-gray-600 dark:text-gray-300',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400'
}

// Base empty state component
export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className={`text-xl font-semibold mb-2 ${variantClasses[variant]}`}>
        {title}
      </h3>
      <p className={`text-gray-600 dark:text-gray-300 mb-6 ${variantClasses[variant]}`}>
        {description}
      </p>
      {action}
    </div>
  )
}

// Specialized empty state components
export interface NoDataEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  className?: string
}

export function NoDataEmptyState({
  title = 'No Data',
  description = 'No data available to display',
  actionLabel = 'Add Data',
  actionHref,
  actionOnClick,
  className = ''
}: NoDataEmptyStateProps) {
  const action = actionHref ? (
    <LinkButton href={actionHref} variant="primary">
      {actionLabel}
    </LinkButton>
  ) : actionOnClick ? (
    <Button onClick={actionOnClick} variant="primary">
      {actionLabel}
    </Button>
  ) : null

  return (
    <EmptyState
      icon="📊"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  )
}

export interface ErrorEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionOnClick?: () => void
  className?: string
}

export function ErrorEmptyState({
  title = 'Something went wrong',
  description = 'We encountered an error while loading the data',
  actionLabel = 'Try Again',
  actionOnClick,
  className = ''
}: ErrorEmptyStateProps) {
  const action = actionOnClick ? (
    <Button onClick={actionOnClick} variant="primary">
      {actionLabel}
    </Button>
  ) : null

  return (
    <EmptyState
      icon="❌"
      title={title}
      description={description}
      action={action}
      variant="error"
      className={className}
    />
  )
}

export interface NotFoundEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function NotFoundEmptyState({
  title = 'Not Found',
  description = 'The requested resource could not be found',
  actionLabel = 'Go Home',
  actionHref = '/',
  className = ''
}: NotFoundEmptyStateProps) {
  return (
    <EmptyState
      icon="🔍"
      title={title}
      description={description}
      action={
        <LinkButton href={actionHref} variant="primary">
          {actionLabel}
        </LinkButton>
      }
      variant="warning"
      className={className}
    />
  )
}

export interface SuccessEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  className?: string
}

export function SuccessEmptyState({
  title = 'All Done!',
  description = 'You have completed all available tasks',
  actionLabel = 'View Dashboard',
  actionHref,
  actionOnClick,
  className = ''
}: SuccessEmptyStateProps) {
  const action = actionHref ? (
    <LinkButton href={actionHref} variant="primary">
      {actionLabel}
    </LinkButton>
  ) : actionOnClick ? (
    <Button onClick={actionOnClick} variant="primary">
      {actionLabel}
    </Button>
  ) : null

  return (
    <EmptyState
      icon="✅"
      title={title}
      description={description}
      action={action}
      variant="success"
      className={className}
    />
  )
}

export interface InfoEmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  actionOnClick?: () => void
  className?: string
}

export function InfoEmptyState({
  title = 'Get Started',
  description = 'Begin by creating your first item',
  actionLabel = 'Create Item',
  actionHref,
  actionOnClick,
  className = ''
}: InfoEmptyStateProps) {
  const action = actionHref ? (
    <LinkButton href={actionHref} variant="primary">
      {actionLabel}
    </LinkButton>
  ) : actionOnClick ? (
    <Button onClick={actionOnClick} variant="primary">
      {actionLabel}
    </Button>
  ) : null

  return (
    <EmptyState
      icon="ℹ️"
      title={title}
      description={description}
      action={action}
      variant="info"
      className={className}
    />
  )
}

// Calculator-specific empty states
export interface CalculatorEmptyStateProps {
  calculatorType: string
  actionHref?: string
  className?: string
}

export function CalculatorEmptyState({
  calculatorType,
  actionHref = '/tools/calculators',
  className = ''
}: CalculatorEmptyStateProps) {
  const calculatorIcons = {
    roi: '📈',
    'break-even': '⚖️',
    investment: '💰',
    revenue: '📊',
    'operating-costs': '💸',
    loan: '🏦'
  }

  const icon = calculatorIcons[calculatorType as keyof typeof calculatorIcons] || '🧮'

  return (
    <EmptyState
      icon={icon}
      title={`No ${calculatorType.replace('-', ' ')} calculations yet`}
      description="Start by using our calculators to generate some financial analysis"
      action={
        <LinkButton href={actionHref} variant="primary">
          Go to Calculators
        </LinkButton>
      }
      className={className}
    />
  )
}

// Reports-specific empty states
export interface ReportsEmptyStateProps {
  reportType?: string
  actionHref?: string
  className?: string
}

export function ReportsEmptyState({
  reportType = 'reports',
  actionHref = '/tools/calculators',
  className = ''
}: ReportsEmptyStateProps) {
  return (
    <EmptyState
      icon="📊"
      title={`No ${reportType} found`}
      description="Start by using our calculators to generate some financial analysis"
      action={
        <LinkButton href={actionHref} variant="primary">
          <span className="mr-2">💰</span>
          Go to Calculators
        </LinkButton>
      }
      className={className}
    />
  )
}

// Dashboard-specific empty states
export interface DashboardEmptyStateProps {
  section?: string
  actionHref?: string
  className?: string
}

export function DashboardEmptyState({
  section = 'data',
  actionHref = '/tools/ai-wizard',
  className = ''
}: DashboardEmptyStateProps) {
  return (
    <EmptyState
      icon="📈"
      title={`No ${section} available`}
      description="Create your first farm plan to get started with comprehensive analysis"
      action={
        <LinkButton href={actionHref} variant="primary">
          <span className="mr-2">🤖</span>
          Start AI Farm Planning
        </LinkButton>
      }
      className={className}
    />
  )
}

// Generic empty state with custom content
export interface CustomEmptyStateProps {
  icon: string
  title: string
  description: string
  actions?: React.ReactNode[]
  variant?: EmptyStateVariant
  className?: string
}

export function CustomEmptyState({
  icon,
  title,
  description,
  actions = [],
  variant = 'default',
  className = ''
}: CustomEmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <span className="text-6xl mb-4 block">{icon}</span>
      <h3 className={`text-xl font-semibold mb-2 ${variantClasses[variant]}`}>
        {title}
      </h3>
      <p className={`text-gray-600 dark:text-gray-300 mb-6 ${variantClasses[variant]}`}>
        {description}
      </p>
      {actions.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {actions.map((action, index) => (
            <div key={index}>{action}</div>
          ))}
        </div>
      )}
    </div>
  )
}
