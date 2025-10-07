'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <nav className="hidden md:flex items-center space-x-6">
      <Link 
        href="/" 
        className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        Home
      </Link>
      <Link 
        href="/docs/diversified-farm-plan" 
        className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        Documentation
      </Link>
      <Link 
        href="/tools/calculators" 
        className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        Calculators
      </Link>
      <Link 
        href="/tools/dashboard" 
        className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        Dashboard
      </Link>
      <a 
        href="https://github.com/JustAGhosT/farm-business-plan" 
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors font-medium"
      >
        GitHub
      </a>
      <a 
        href="https://farmplan.netlify.app/" 
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
      >
        🚀 Live Demo
      </a>
    </nav>
  )
}
