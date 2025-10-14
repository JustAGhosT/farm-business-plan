'use client'

import React from 'react'

interface OAuthButtonProps {
  provider: 'google' | 'github'
  onClick: () => void
  disabled?: boolean
  variant?: 'signin' | 'signup'
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
)

const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.607.069-.607 1.003.07 1.53 1.03 1.53 1.03.893 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.952 0-1.094.39-1.99 1.029-2.69-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0 1 12 6.845c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.596 1.028 2.69 0 3.848-2.339 4.695-4.566 4.943.359.309.679.92.679 1.854 0 1.338-.012 2.418-.012 2.747 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z"
      clipRule="evenodd"
    />
  </svg>
)

function UnavailableBox({ title, details }: { title: string; details: React.ReactNode }) {
  return (
    <div
      className="mt-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900 text-sm dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
      role="status"
      aria-live="polite"
    >
      <div className="font-medium">{title}</div>
      <div className="mt-1 space-y-1">{details}</div>
    </div>
  )
}

export function OAuthButton({
  provider,
  onClick,
  disabled = false,
  variant = 'signin',
}: OAuthButtonProps) {
  const isGoogle = provider === 'google'
  const actionText = variant === 'signin' ? 'Sign in' : 'Sign up'

  const buttonClass = isGoogle
    ? 'w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'
    : 'w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 dark:bg-gray-700 border border-gray-900 dark:border-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium'

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={buttonClass}>
      {isGoogle ? <GoogleIcon /> : <GitHubIcon />}
      {actionText} with {isGoogle ? 'Google' : 'GitHub'}
    </button>
  )
}

interface OAuthButtonsProps {
  onGoogleSignIn: () => void
  onGitHubSignIn: () => void
  disabled?: boolean
  variant?: 'signin' | 'signup'
}

export function OAuthButtons({
  onGoogleSignIn,
  onGitHubSignIn,
  disabled = false,
  variant = 'signin',
}: OAuthButtonsProps) {
  const showGoogle = process.env.NEXT_PUBLIC_GOOGLE_ENABLED === 'true'
  const showGitHub = process.env.NEXT_PUBLIC_GITHUB_ENABLED === 'true'

  // When neither provider is enabled, show a helpful notice instead of hiding the entire section
  if (!showGoogle && !showGitHub) {
    return (
      <UnavailableBox
        title="Sign in with Google or GitHub is unavailable"
        details={
          <>
            <p>No OAuth providers are enabled in this environment.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                To enable Google: set <code>NEXT_PUBLIC_GOOGLE_ENABLED=&quot;true&quot;</code> and
                configure your OAuth credentials and redirect URI.
              </li>
              <li>
                Ensure your auth URL is configured (e.g., <code>NEXTAUTH_URL</code>) and that your
                redirect URIs match in the provider console.
              </li>
              <li>
                See docs:{' '}
                <a className="underline" href="/docs/guides/GOOGLE_LOGIN_SETUP.md">
                  Google Login Setup Guide
                </a>
              </li>
            </ul>
          </>
        }
      />
    )
  }

  // Collect per-provider availability notes
  const notices: React.ReactNode[] = []
  if (!showGoogle) {
    notices.push(
      <div key="google">
        <div className="font-medium">Google sign-in unavailable</div>
        <ul className="list-disc pl-5">
          <li>
            Not enabled. Set <code>NEXT_PUBLIC_GOOGLE_ENABLED=&quot;true&quot;</code> to show the
            Google button.
          </li>
          <li>
            Also ensure your OAuth app and redirect URI are configured in Google Cloud Console.
          </li>
          <li>
            Docs:{' '}
            <a className="underline" href="/docs/guides/GOOGLE_LOGIN_SETUP.md">
              Google Login Setup Guide
            </a>
          </li>
        </ul>
      </div>
    )
  }
  if (!showGitHub) {
    notices.push(
      <div key="github">
        <div className="font-medium">GitHub sign-in unavailable</div>
        <ul className="list-disc pl-5">
          <li>
            Not enabled. Set <code>NEXT_PUBLIC_GITHUB_ENABLED=&quot;true&quot;</code> to show the
            GitHub button.
          </li>
          <li>Configure your OAuth app and callback URL in GitHub Developer Settings.</li>
        </ul>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {showGoogle && (
          <OAuthButton
            provider="google"
            onClick={onGoogleSignIn}
            disabled={disabled}
            variant={variant}
          />
        )}
        {showGitHub && (
          <OAuthButton
            provider="github"
            onClick={onGitHubSignIn}
            disabled={disabled}
            variant={variant}
          />
        )}
      </div>

      {(showGoogle || showGitHub) && (
        <div className="mt-6 flex items-center">
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
          <span className="px-4 text-sm text-gray-500 dark:text-gray-400">or</span>
          <div className="flex-1 border-t border-gray-300 dark:border-gray-600" />
        </div>
      )}

      {notices.length > 0 && (
        <UnavailableBox
          title="Some sign-in options are unavailable"
          details={<div className="space-y-2">{notices}</div>}
        />
      )}
    </>
  )
}
