import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'
import { ToastProvider } from '@/components/ToastProvider'
import { GlobalKeyboardShortcuts } from '@/components/KeyboardShortcuts'
import ThemeToggle from '@/components/ThemeToggle'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AuthProvider from '@/components/AuthProvider'

export const metadata: Metadata = {
  title: 'Agricultural Business Plan Template',
  description: 'Comprehensive framework for developing agricultural business plans and farm management',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors flex flex-col min-h-screen">
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <GlobalKeyboardShortcuts />
              <Header />
              <ThemeToggle />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
