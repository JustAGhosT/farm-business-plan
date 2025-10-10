import React from 'react'

interface SectionProps {
  children: React.ReactNode
  variant?: 'default' | 'gradient' | 'featured'
  className?: string
}

export function Section({ children, variant = 'default', className = '' }: SectionProps) {
  const baseClasses = 'rounded-xl shadow-xl p-10 mb-16'

  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
    gradient:
      'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800',
    featured:
      'bg-gradient-to-r from-primary-500 to-primary-600 dark:from-primary-600 dark:to-primary-700 text-white transform hover:scale-[1.02] transition-all duration-300',
  }

  return (
    <section className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </section>
  )
}
