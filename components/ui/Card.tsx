import React from 'react'
import Link from 'next/link'

interface CardProps {
  children: React.ReactNode
  href?: string
  variant?: 'default' | 'bordered' | 'elevated'
  hover?: boolean
  className?: string
}

export function Card({
  children,
  href,
  variant = 'default',
  hover = true,
  className = '',
}: CardProps) {
  const baseClasses = 'rounded-xl p-6 transition-all duration-300'

  const variantClasses = {
    default:
      'bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700',
    bordered:
      'border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700',
    elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
  }

  const hoverClasses = hover ? 'hover:-translate-y-1 transform' : ''

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${className}`

  if (href) {
    return (
      <Link href={href} className={`${combinedClasses} block group`}>
        {children}
      </Link>
    )
  }

  return <div className={combinedClasses}>{children}</div>
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3
      className={`font-bold text-lg mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${className}`}
    >
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-gray-600 dark:text-gray-300 text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  )
}
