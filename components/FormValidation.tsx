'use client'

import { useState } from 'react'

interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: string) => boolean
  message?: string
}

interface ValidationRules {
  [key: string]: ValidationRule
}

interface ValidationErrors {
  [key: string]: string
}

/**
 * Custom hook for form validation
 * Provides validation logic and error management
 */
export function useFormValidation(rules: ValidationRules) {
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())

  const validateField = (name: string, value: string): string | null => {
    const rule = rules[name]
    if (!rule) return null

    // Required validation
    if (rule.required && !value.trim()) {
      return rule.message || 'This field is required'
    }

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return rule.message || `Minimum ${rule.minLength} characters required`
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `Maximum ${rule.maxLength} characters allowed`
    }

    // Numeric min validation
    if (rule.min !== undefined) {
      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue < rule.min) {
        return rule.message || `Minimum value is ${rule.min}`
      }
    }

    // Numeric max validation
    if (rule.max !== undefined) {
      const numValue = parseFloat(value)
      if (isNaN(numValue) || numValue > rule.max) {
        return rule.message || `Maximum value is ${rule.max}`
      }
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Invalid format'
    }

    // Custom validation
    if (rule.custom && !rule.custom(value)) {
      return rule.message || 'Invalid value'
    }

    return null
  }

  const validateForm = (formData: { [key: string]: string }): boolean => {
    const newErrors: ValidationErrors = {}
    let isValid = true

    Object.keys(rules).forEach((name) => {
      const error = validateField(name, formData[name] || '')
      if (error) {
        newErrors[name] = error
        isValid = false
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => new Set(prev).add(name))
    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error || '',
    }))
  }

  const clearError = (name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }

  const clearAllErrors = () => {
    setErrors({})
    setTouched(new Set())
  }

  return {
    errors,
    touched,
    validateForm,
    handleBlur,
    clearError,
    clearAllErrors,
    hasError: (name: string) => touched.has(name) && !!errors[name],
    getError: (name: string) => (touched.has(name) ? errors[name] : undefined),
  }
}

interface FormInputProps {
  label: string
  name: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (name: string, value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  helpText?: string
  min?: number | string
  max?: number | string
  step?: number | string
  disabled?: boolean
  className?: string
}

/**
 * Form input component with built-in validation display
 */
export function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  helpText,
  min,
  max,
  step,
  disabled = false,
  className = '',
}: FormInputProps) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={(e) => onBlur?.(name, e.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  )
}

interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: (name: string, value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  helpText?: string
  rows?: number
  disabled?: boolean
  className?: string
}

/**
 * Form textarea component with built-in validation display
 */
export function FormTextarea({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  helpText,
  rows = 4,
  disabled = false,
  className = '',
}: FormTextareaProps) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={(e) => onBlur?.(name, e.target.value)}
        required={required}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
      )}
    </div>
  )
}
