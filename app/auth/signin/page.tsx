'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FormInput, useFormValidation } from '@/components/FormValidation'
import { OAuthButtons } from '@/components/auth/OAuthButtons'
import { ErrorAlert } from '@/components/auth/ErrorAlert'
import { AuthLayout } from '@/components/auth/AuthLayout'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const validationRules = {
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address',
    },
    password: {
      required: true,
      minLength: 8,
      message: 'Password is required',
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
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        const callbackUrl = searchParams.get('callbackUrl') || '/tools/dashboard'
        router.push(callbackUrl)
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
        callbackUrl: searchParams.get('callbackUrl') || '/tools/dashboard',
      })
    } catch (err) {
      setError('OAuth sign-in failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Sign in to your farm management account">
      <ErrorAlert message={error} />

      <OAuthButtons
        onGoogleSignIn={() => handleOAuthSignIn('google')}
        onGitHubSignIn={() => handleOAuthSignIn('github')}
        disabled={loading}
        variant="signin"
      />

      <form onSubmit={handleSubmit} className="space-y-6 mt-6">
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
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link
          href="/auth/register"
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
        >
          Register here
        </Link>
      </div>
    </AuthLayout>
  )
}

export default function SignIn() {
  return (
    <Suspense
      fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}
    >
      <SignInForm />
    </Suspense>
  )
}
