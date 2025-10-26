'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

// Base layout configuration
export interface BaseLayoutProps {
  children: React.ReactNode
  variant?: 'default' | 'auth' | 'wizard' | 'page'
  className?: string
}

// Page-specific layout props
export interface PageLayoutProps extends BaseLayoutProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export interface AuthLayoutProps extends BaseLayoutProps {
  title: string
  subtitle: string
  showBackLink?: boolean
}

export interface WizardLayoutProps extends BaseLayoutProps {
  title: string
  description: string
  step: number
  totalSteps: number
  isFormValid?: boolean
  onNext?: () => void
  onBack?: () => void
  showProgress?: boolean
}

// Shared layout component
export function BaseLayout({ 
  children, 
  variant = 'default',
  className = '' 
}: BaseLayoutProps) {
  const baseClasses = "min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800"
  
  const variantClasses = {
    default: "flex items-center justify-center px-4 py-8",
    auth: "flex items-center justify-center px-4 py-12",
    wizard: "px-4 py-8",
    page: "px-4 py-8"
  }
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  )
}

// Container component with consistent max-widths
export function LayoutContainer({ 
  children, 
  maxWidth = 'xl',
  className = '' 
}: {
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  className?: string
}) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  }
  
  return (
    <div className={`container mx-auto ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  )
}

// Card wrapper component
export function LayoutCard({ 
  children, 
  className = '',
  padding = 'lg',
  shadow = 'lg'
}: {
  children: React.ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  shadow?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  }
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg ${shadowClasses[shadow]} ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  )
}

// Unified Page Layout
export function UnifiedPageLayout({
  children,
  title,
  subtitle,
  actions,
  maxWidth = 'xl',
  className = ''
}: PageLayoutProps) {
  return (
    <BaseLayout variant="page" className={className}>
      <LayoutContainer maxWidth={maxWidth}>
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-300">
                  {subtitle}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex gap-3">
                {actions}
              </div>
            )}
          </div>
        </div>
        {children}
      </LayoutContainer>
    </BaseLayout>
  )
}

// Unified Auth Layout
export function UnifiedAuthLayout({
  children,
  title,
  subtitle,
  showBackLink = true,
  className = ''
}: AuthLayoutProps) {
  return (
    <BaseLayout variant="auth" className={className}>
      <LayoutContainer maxWidth="md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {subtitle}
          </p>
        </div>

        <LayoutCard>
          {children}
        </LayoutCard>

        {showBackLink && (
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              ← Back to home
            </Link>
          </div>
        )}
      </LayoutContainer>
    </BaseLayout>
  )
}

// Unified Wizard Layout
export function UnifiedWizardLayout({
  children,
  title,
  description,
  step,
  totalSteps,
  isFormValid = true,
  onNext,
  onBack,
  showProgress = true,
  className = ''
}: WizardLayoutProps) {
  const router = useRouter()
  
  const handleNext = () => {
    if (onNext) {
      onNext()
    }
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const progressPercentage = (step / totalSteps) * 100

  return (
    <BaseLayout variant="wizard" className={className}>
      <LayoutContainer maxWidth="xl">
        <LayoutCard>
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {description}
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Step {step} of {totalSteps}
            </div>
          </div>

          {/* Progress Bar */}
          {showProgress && (
            <div className="mb-8">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            /* eslint-disable-next-line react/no-inline-styles */
            style={{ width: `${progressPercentage}%` }}
          />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="mb-8">
            {children}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isFormValid}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === totalSteps ? 'Complete' : 'Next →'}
            </button>
          </div>
        </LayoutCard>
      </LayoutContainer>
    </BaseLayout>
  )
}

// Backward compatibility exports
export const PageLayout = UnifiedPageLayout
export const AuthLayout = UnifiedAuthLayout
export const WizardLayout = UnifiedWizardLayout
