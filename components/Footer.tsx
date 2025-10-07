'use client'

import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-2xl shadow-md">
                🌾
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  Farm Business Plan
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Agricultural Planning Tool
                </div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
              A comprehensive framework for developing professional agricultural business plans
              and managing farm operations - adaptable for any crop, location, or scale.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/JustAGhosT/farm-business-plan" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://farmplan.netlify.app/" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                aria-label="Live Demo"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/docs/diversified-farm-plan" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tools/calculators" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                  Calculators
                </Link>
              </li>
              <li>
                <Link href="/tools/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/tools/ai-wizard" className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm">
                  AI Wizard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://github.com/JustAGhosT/farm-business-plan" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  GitHub Repository
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/JustAGhosT/farm-business-plan/issues" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a 
                  href="https://farmplan.netlify.app/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  Live Demo
                </a>
              </li>
              <li>
                <a 
                  href="https://opensource.org/licenses/MIT" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors text-sm"
                >
                  MIT License
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Tech Stack Badges */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mb-8">
          <div className="text-center mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider">
              Built With
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-black text-white">
                Next.js 14+
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                TypeScript 5+
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-500 text-white">
                Tailwind CSS 3+
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-500 text-white">
                Netlify
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-left">
              <p>
                <span className="font-medium">Version:</span> 3.0 - General Agricultural Template
              </p>
              <p className="mt-1">
                © {currentYear} Farm Business Plan. All rights reserved.
              </p>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 text-center md:text-right">
              <p className="font-medium">
                Made with 🌾 for farmers and agricultural entrepreneurs worldwide
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
