'use client'

import React from 'react'
import { ErrorMessage } from '@/lib/error-handling'

// Base form field props
export interface BaseFormFieldProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  onBlur?: (name: string, value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  helpText?: string
  disabled?: boolean
  className?: string
}

// Input field component
export interface FormInputProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search'
  min?: number | string
  max?: number | string
  step?: number | string
  autoComplete?: string
}

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
  autoComplete,
}: FormInputProps) {
  const baseClasses =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors'
  const errorClasses = error
    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'

  const inputClasses = `${baseClasses} ${errorClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`

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
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(name, e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        autoComplete={autoComplete}
        className={inputClasses}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        {...(error && { 'aria-invalid': 'true' })}
      />
      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && <ErrorMessage error={error} className="mt-1" />}
    </div>
  )
}

// Number input component
export interface FormNumberProps extends BaseFormFieldProps {
  min?: number
  max?: number
  step?: number
  precision?: number
}

export function FormNumber({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  placeholder,
  helpText,
  min,
  max,
  step = 1,
  precision,
  disabled = false,
  className = '',
}: FormNumberProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    if (precision !== undefined && newValue) {
      const num = parseFloat(newValue)
      if (!isNaN(num)) {
        newValue = num.toFixed(precision)
      }
    }

    onChange(newValue)
  }

  return (
    <FormInput
      label={label}
      name={name}
      type="number"
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={error}
      required={required}
      placeholder={placeholder}
      helpText={helpText}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      className={className}
    />
  )
}

// Textarea component
export interface FormTextareaProps extends BaseFormFieldProps {
  rows?: number
  maxLength?: number
}

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
  rows = 3,
  maxLength,
  disabled = false,
  className = '',
}: FormTextareaProps) {
  const baseClasses =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-vertical'
  const errorClasses = error
    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'

  const textareaClasses = `${baseClasses} ${errorClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`

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
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        className={textareaClasses}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        {...(error && { 'aria-invalid': 'true' })}
      />
      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && <ErrorMessage error={error} className="mt-1" />}
    </div>
  )
}

// Select component
export interface FormSelectProps extends BaseFormFieldProps {
  options: Array<{ value: string; label: string; disabled?: boolean }>
  multiple?: boolean
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  helpText,
  options,
  multiple = false,
  disabled = false,
  className = '',
}: FormSelectProps) {
  const baseClasses =
    'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors'
  const errorClasses = error
    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'

  const selectClasses = `${baseClasses} ${errorClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur?.(name, e.target.value)}
        multiple={multiple}
        disabled={disabled}
        className={selectClasses}
        aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
        {...(error && { 'aria-invalid': 'true' })}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {helpText && !error && (
        <p id={`${name}-help`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && <ErrorMessage error={error} className="mt-1" />}
    </div>
  )
}

// Checkbox component
export interface FormCheckboxProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  checked: boolean
  onChange: (checked: boolean) => void
}

export function FormCheckbox({
  label,
  name,
  checked,
  onChange,
  onBlur,
  error,
  required = false,
  helpText,
  disabled = false,
  className = '',
}: FormCheckboxProps) {
  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={name}
            name={name}
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={(e) => onBlur?.(name, e.target.checked.toString())}
            disabled={disabled}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
            aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
            {...(error && { 'aria-invalid': 'true' })}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={name} className="font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {helpText && !error && (
            <p id={`${name}-help`} className="text-gray-500 dark:text-gray-400">
              {helpText}
            </p>
          )}
          {error && <ErrorMessage error={error} className="mt-1" />}
        </div>
      </div>
    </div>
  )
}

// Radio group component
export interface FormRadioGroupProps extends Omit<BaseFormFieldProps, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

export function FormRadioGroup({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  helpText,
  options,
  disabled = false,
  className = '',
}: FormRadioGroupProps) {
  return (
    <div className={className}>
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={`${name}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={(e) => onBlur?.(name, e.target.value)}
                disabled={disabled || option.disabled}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                aria-describedby={error ? `${name}-error` : helpText ? `${name}-help` : undefined}
                {...(error && { 'aria-invalid': 'true' })}
              />
              <label
                htmlFor={`${name}-${option.value}`}
                className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
        {helpText && !error && (
          <p id={`${name}-help`} className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {helpText}
          </p>
        )}
        {error && <ErrorMessage error={error} className="mt-2" />}
      </fieldset>
    </div>
  )
}

// Form field group component
export interface FormFieldGroupProps {
  children: React.ReactNode
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FormFieldGroup({ children, columns = 1, className = '' }: FormFieldGroupProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>{children}</div>
}
