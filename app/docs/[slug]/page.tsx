import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import MarkdownRenderer from '@/components/MarkdownRenderer'

const DOCS_PATH = path.join(process.cwd(), 'docs')

const docFiles = [
  'diversified-farm-plan',
  'executive-summary',
  'technical-implementation',
  'financial-analysis',
  'operations-manual',
  'market-strategy',
  'risk-management',
  'implementation-timeline',
  'appendices'
]

export async function generateStaticParams() {
  return docFiles.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const title = params.slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
  
  return {
    title: `${title} | Agricultural Business Plan`,
    description: `View the ${title} template for agricultural business planning`
  }
}

export default function DocPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(DOCS_PATH, `${params.slug}.md`)
  
  if (!fs.existsSync(filePath)) {
    notFound()
  }
  
  const content = fs.readFileSync(filePath, 'utf-8')
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
        
        <MarkdownRenderer content={content} />
      </div>
    </div>
  )
}
