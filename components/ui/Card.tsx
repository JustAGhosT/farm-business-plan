import React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva('rounded-xl p-6 transition-all duration-300', {
  variants: {
    variant: {
      default:
        'bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700',
      bordered:
        'border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-600 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl',
    },
    hover: {
      true: 'hover:-translate-y-1 transform',
    },
  },
  defaultVariants: {
    variant: 'default',
    hover: true,
  },
})

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  href?: string
}

export function Card({ className, variant, hover, href, ...props }: CardProps) {
  const classes = cardVariants({ variant, hover, className })

  if (href) {
    return <Link href={href} className={`${classes} block group`} {...props} />
  }

  return <div className={classes} {...props} />
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
