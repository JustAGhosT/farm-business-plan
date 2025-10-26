'use client'

import Link from 'next/link'
import React from 'react'
import { Spinner } from './Loading'

// Button variants and sizes
export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline'
  | 'ghost'
  | 'link'

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// Base button props
export interface BaseButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

// Size configurations
const sizeClasses = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  xl: 'px-8 py-4 text-lg',
}

// Variant configurations
const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
  success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
  error: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  outline:
    'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
  ghost: 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 focus:ring-primary-500',
  link: 'text-primary-600 hover:text-primary-700 underline focus:ring-primary-500',
}

// Base button component
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
}: BaseButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const widthClass = fullWidth ? 'w-full' : ''

  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={buttonClasses}>
      {loading && <Spinner size="sm" variant="secondary" className="mr-2" />}
      {children}
    </button>
  )
}

// Icon button component
export interface IconButtonProps extends Omit<BaseButtonProps, 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export function IconButton({
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}: IconButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const iconSizeClasses = {
    xs: 'p-1',
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  }

  const buttonClasses = [baseClasses, iconSizeClasses[size], variantClasses[variant], className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      aria-label={ariaLabel}
    >
      {loading ? <Spinner size="sm" variant="secondary" /> : icon}
    </button>
  )
}

// Link button component
export interface LinkButtonProps extends BaseButtonProps {
  href: string
  external?: boolean
}

export function LinkButton({
  children,
  href,
  external = false,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  fullWidth = false,
}: LinkButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const widthClass = fullWidth ? 'w-full' : ''

  const buttonClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses}
        tabIndex={disabled || loading ? -1 : undefined}
        onClick={(e) => {
          if (disabled || loading) {
            e.preventDefault()
          }
        }}
        {...((disabled || loading) && { 'aria-disabled': 'true' })}
      >
        {loading && <Spinner size="sm" variant="secondary" className="mr-2" />}
        {children}
      </a>
    )
  }

  return (
    <Link
      href={href}
      className={buttonClasses}
      tabIndex={disabled || loading ? -1 : undefined}
      onClick={(e) => {
        if (disabled || loading) {
          e.preventDefault()
        }
      }}
      {...((disabled || loading) && { 'aria-disabled': 'true' })}
    >
      {loading && <Spinner size="sm" variant="secondary" className="mr-2" />}
      {children}
    </Link>
  )
}

// Button group component
export interface ButtonGroupProps {
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
  spacing?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ButtonGroup({
  children,
  orientation = 'horizontal',
  spacing = 'md',
  className = '',
}: ButtonGroupProps) {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  }

  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'space-x-1' : 'space-y-1',
    md: orientation === 'horizontal' ? 'space-x-2' : 'space-y-2',
    lg: orientation === 'horizontal' ? 'space-x-4' : 'space-y-4',
  }

  return (
    <div
      className={`flex ${orientationClasses[orientation]} ${spacingClasses[spacing]} ${className}`}
    >
      {children}
    </div>
  )
}

// Action button variants for common use cases
export function PrimaryButton(props: BaseButtonProps) {
  return <Button {...props} variant="primary" />
}

export function SecondaryButton(props: BaseButtonProps) {
  return <Button {...props} variant="secondary" />
}

export function SuccessButton(props: BaseButtonProps) {
  return <Button {...props} variant="success" />
}

export function WarningButton(props: BaseButtonProps) {
  return <Button {...props} variant="warning" />
}

export function ErrorButton(props: BaseButtonProps) {
  return <Button {...props} variant="error" />
}

export function OutlineButton(props: BaseButtonProps) {
  return <Button {...props} variant="outline" />
}

export function GhostButton(props: BaseButtonProps) {
  return <Button {...props} variant="ghost" />
}

// Specialized button components
export interface SaveButtonProps extends Omit<BaseButtonProps, 'children'> {
  saving?: boolean
  saved?: boolean
}

export function SaveButton({ saving = false, saved = false, ...props }: SaveButtonProps) {
  return (
    <Button {...props} variant={saved ? 'success' : 'primary'} loading={saving}>
      {saved ? 'Saved' : 'Save'}
    </Button>
  )
}

export interface DeleteButtonProps extends Omit<BaseButtonProps, 'children' | 'variant'> {
  deleting?: boolean
}

export function DeleteButton({ deleting = false, ...props }: DeleteButtonProps) {
  return (
    <Button {...props} variant="error" loading={deleting}>
      Delete
    </Button>
  )
}

export interface CancelButtonProps extends Omit<BaseButtonProps, 'children' | 'variant'> {}

export function CancelButton(props: CancelButtonProps) {
  return (
    <Button {...props} variant="outline">
      Cancel
    </Button>
  )
}

export interface SubmitButtonProps extends Omit<BaseButtonProps, 'children' | 'variant' | 'type'> {
  submitting?: boolean
}

export function SubmitButton({ submitting = false, ...props }: SubmitButtonProps) {
  return (
    <Button {...props} variant="primary" type="submit" loading={submitting}>
      Submit
    </Button>
  )
}
