import type { Metadata } from 'next'
import './globals.css'

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
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
