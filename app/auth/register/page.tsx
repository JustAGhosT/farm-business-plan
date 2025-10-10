'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { FormInput, useFormValidation } from '@/components/FormValidation'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { ErrorAlert } from '@/components/auth/ErrorAlert'
import { AuthLayout } from '@/components/auth/AuthLayout'

export default function Register() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const validationRules = {
    name: {
      required: true,
      minLength: 2,
      message: 'Name must be at least 2 characters',
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    password: {
      required: true,
      minLength: 8,
      message: 'Password must be at least 8 characters',
    },
    confirmPassword: {
      required: true,
      custom: (value: string) => value === formData.password,
      message: 'Passwords do not match',
    },
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
          password: formData.password,
        }),
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
      [e.target.name]: e.target.value,
    })
  }

  const handleOAuthSignIn = async (provider: string) => {
    setLoading(true)
    try {
      await signIn(provider, {
        callbackUrl: '/tools/dashboard',
      })
    } catch (err) {
      setError('OAuth sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create Account" subtitle="Start managing your farm with our tools">
      <ErrorAlert message={error} />

      <OAuthButtons
        onGoogleSignIn={() => handleOAuthSignIn('google')}
        onGitHubSignIn={() => handleOAuthSignIn('github')}
        disabled={loading}
        variant="signup"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
        <FormInput
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError('name')}
          required
          placeholder="John Doe"
          disabled={loading}
        />
        <FormInput
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError('email')}
          required
          placeholder="your@email.com"
          disabled={loading}
        />
        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError('password')}
          required
          placeholder="••••••••"
          helpText="Must be at least 8 characters"
          disabled={loading}
        />
        <FormInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          error={getError('confirmPassword')}
          required
          placeholder="••••••••"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          href="/auth/signin"
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
        >
          Sign in here
        </Link>
      </div>
    </AuthLayout>
  )
}
