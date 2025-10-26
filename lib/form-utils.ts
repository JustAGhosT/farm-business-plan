// Shared form handling utilities for calculators
export interface FormField {
  id: string
  label: string
  type: 'text' | 'number' | 'select' | 'textarea' | 'email' | 'tel'
  required?: boolean
  options?: string[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
  validation?: (value: string) => string | null
}

export interface FormState {
  [key: string]: string
}

export interface FormErrors {
  [key: string]: string
}

// Common validation functions
export const validators = {
  required: (value: string) => (!value || value.trim() === '') ? 'This field is required' : null,
  number: (value: string) => {
    if (!value) return null
    const num = parseFloat(value)
    return isNaN(num) ? 'Must be a valid number' : null
  },
  positiveNumber: (value: string) => {
    if (!value) return null
    const num = parseFloat(value)
    if (isNaN(num)) return 'Must be a valid number'
    if (num < 0) return 'Must be a positive number'
    return null
  },
  email: (value: string) => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !emailRegex.test(value) ? 'Must be a valid email address' : null
  },
  phone: (value: string) => {
    if (!value) return null
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return !phoneRegex.test(value.replace(/\s/g, '')) ? 'Must be a valid phone number' : null
  }
}

// Form validation helper
export const validateForm = (formData: FormState, fields: FormField[]): FormErrors => {
  const errors: FormErrors = {}
  
  fields.forEach(field => {
    const value = formData[field.id] || ''
    
    // Check required fields
    if (field.required && validators.required(value)) {
      errors[field.id] = validators.required(value)!
      return
    }
    
    // Skip validation for empty optional fields
    if (!value && !field.required) return
    
    // Run custom validation
    if (field.validation) {
      const error = field.validation(value)
      if (error) {
        errors[field.id] = error
        return
      }
    }
    
    // Run type-specific validation
    switch (field.type) {
      case 'number':
        const numberError = validators.number(value)
        if (numberError) {
          errors[field.id] = numberError
        }
        break
      case 'email':
        const emailError = validators.email(value)
        if (emailError) {
          errors[field.id] = emailError
        }
        break
      case 'tel':
        const phoneError = validators.phone(value)
        if (phoneError) {
          errors[field.id] = phoneError
        }
        break
    }
  })
  
  return errors
}

// Form field renderer
export const renderFormField = (
  field: FormField,
  value: string,
  onChange: (value: string) => void,
  error?: string
) => {
  const baseClasses = "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
  const errorClasses = error 
    ? "border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20" 
    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
  
  const inputClasses = `${baseClasses} ${errorClasses}`
  
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={field.placeholder}
          rows={3}
        />
      )
    
    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      )
    
    default:
      return (
        <input
          type={field.type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClasses}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      )
  }
}

// Common form patterns
export const commonFields = {
  years: {
    id: 'years',
    label: 'Investment Period (years)',
    type: 'number' as const,
    required: true,
    min: 1,
    max: 20,
    validation: validators.positiveNumber
  },
  notes: {
    id: 'notes',
    label: 'Notes',
    type: 'textarea' as const,
    placeholder: 'Additional notes...'
  },
  email: {
    id: 'email',
    label: 'Email Address',
    type: 'email' as const,
    placeholder: 'your@email.com',
    validation: validators.email
  },
  phone: {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel' as const,
    placeholder: '+27 12 345 6789',
    validation: validators.phone
  }
}

// API utilities for calculator results
export const saveCalculatorResult = async (
  calculatorType: string,
  inputData: FormState,
  results: any,
  notes?: string
) => {
  const response = await fetch('/api/calculator-results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      calculator_type: calculatorType,
      input_data: inputData,
      results: results,
      notes: notes || ''
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to save calculator result')
  }
  
  return response.json()
}

export const fetchCalculatorResults = async (calculatorType?: string, limit = 50) => {
  const url = calculatorType 
    ? `/api/calculator-results?calculator_type=${calculatorType}&limit=${limit}`
    : `/api/calculator-results?limit=${limit}`
    
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error('Failed to fetch calculator results')
  }
  
  return response.json()
}
