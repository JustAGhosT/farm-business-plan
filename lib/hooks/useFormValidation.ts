import { useState, useCallback } from 'react'

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

  const validateField = useCallback(
    (name: string, value: string): string | null => {
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
    },
    [rules]
  )

  const validateForm = useCallback(
    (formData: { [key: string]: string }): boolean => {
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
    },
    [rules, validateField]
  )

  const handleBlur = useCallback(
    (name: string, value: string) => {
      setTouched((prev) => new Set(prev).add(name))
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error || '',
      }))
    },
    [validateField]
  )

  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[name]
      return newErrors
    })
  }, [])

  const clearAllErrors = useCallback(() => {
    setErrors({})
    setTouched(new Set())
  }, [])

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
