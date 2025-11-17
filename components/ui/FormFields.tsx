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
