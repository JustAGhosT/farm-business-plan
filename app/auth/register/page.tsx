'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FormInput, useFormValidation } from '@/components/FormValidation'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      message: 'Name must be at least 2 characters'
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: true,
      minLength: 8,
      message: 'Password must be at least 8 characters'
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => value === formData.password,
      message: 'Passwords do not match'
    }
  }

  const { errors, validateForm, handleBlur, getError } = useFormValidation(validationRules)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm(formData)) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error || 'Registration failed')
      } else {
        router.push('/auth/signin?registered=true')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Start managing your farm with our tools</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormInput label="Full Name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={getError('name')} required placeholder="John Doe" disabled={loading} />
            <FormInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={getError('email')} required placeholder="your@email.com" disabled={loading} />
            <FormInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} error={getError('password')} required placeholder="••••••••" helpText="Must be at least 8 characters" disabled={loading} />
            <FormInput label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={getError('confirmPassword')} required placeholder="••••••••" disabled={loading} />
            <button type="submit" disabled={loading} className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account? <Link href="/auth/signin" className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium">Sign in here</Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">← Back to home</Link>
        </div>
      </div>
    </div>
  )
}
