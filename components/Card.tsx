'use client'

import Link from 'next/link'
import React from 'react'

export interface CardProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'bordered' | 'outlined'
  hover?: boolean
  href?: string
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  background?: 'white' | 'gray' | 'primary' | 'transparent'
}

const variantClasses = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  bordered: 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700',
  outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

const roundedClasses = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
}

const shadowClasses = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
}

const backgroundClasses = {
  white: 'bg-white dark:bg-gray-800',
  gray: 'bg-gray-50 dark:bg-gray-700',
  primary: 'bg-primary-50 dark:bg-primary-900/20',
  transparent: 'bg-transparent',
}

export function Card({
  children,
  className = '',
  variant = 'default',
  hover = false,
  href,
  onClick,
  padding = 'md',
  rounded = 'lg',
  shadow = 'md',
  background = 'white',
}: CardProps) {
  const baseClasses = [
    variantClasses[variant],
    paddingClasses[padding],
    roundedClasses[rounded],
    shadowClasses[shadow],
    backgroundClasses[background],
    hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-300' : '',
    onClick || href ? 'cursor-pointer' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = <div className={baseClasses}>{children}</div>

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button type="button" className={baseClasses} onClick={onClick}>
        {children}
      </button>
    )
  }

  return content
}

// Specialized card components for common patterns
export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = '',
}: {
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  trend?: { value: number; positive: boolean }
  className?: string
}) {
  return (
    <Card className={className} padding="lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-3xl opacity-60">{icon}</div>}
      </div>
    </Card>
  )
}

export function ActionCard({
  title,
  description,
  icon,
  href,
  onClick,
  variant = 'default',
  className = '',
}: {
  title: string
  description: string
  icon: string
  href?: string
  onClick?: () => void
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  className?: string
}) {
  const variantStyles = {
    default:
      'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
    primary:
      'border-primary-200 dark:border-primary-700 hover:border-primary-300 dark:hover:border-primary-600',
    success:
      'border-green-200 dark:border-green-700 hover:border-green-300 dark:hover:border-green-600',
    warning:
      'border-yellow-200 dark:border-yellow-700 hover:border-yellow-300 dark:hover:border-yellow-600',
    error: 'border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600',
  }

  return (
    <Card
      href={href}
      onClick={onClick}
      variant="bordered"
      hover
      className={`${variantStyles[variant]} ${className}`}
    >
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Card>
  )
}

export function InfoCard({
  title,
  children,
  icon,
  variant = 'info',
  className = '',
}: {
  title?: string
  children: React.ReactNode
  icon?: string
  variant?: 'info' | 'success' | 'warning' | 'error'
  className?: string
}) {
  const variantStyles = {
    info: 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20',
    success: 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20',
    warning: 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
    error: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
  }

  const iconStyles = {
    info: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
  }

  return (
    <Card variant="bordered" className={`${variantStyles[variant]} ${className}`}>
      {(title || icon) && (
        <div className="flex items-center mb-3">
          {icon && <span className={`text-xl mr-2 ${iconStyles[variant]}`}>{icon}</span>}
          {title && <h4 className={`font-semibold ${iconStyles[variant]}`}>{title}</h4>}
        </div>
      )}
      <div className="text-sm text-gray-700 dark:text-gray-300">{children}</div>
    </Card>
  )
}
