'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'

interface MarkdownRendererProps {
  content: string
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-10 prose prose-lg max-w-none border border-gray-100 dark:border-gray-700 prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-a:text-primary-600 dark:prose-a:text-primary-400 prose-strong:text-gray-900 dark:prose-strong:text-white prose-code:text-primary-700 dark:prose-code:text-primary-400">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 mt-8 pb-3 border-b-4 border-primary-500 dark:border-primary-600 text-gray-900 dark:text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mb-5 mt-8 text-primary-700 dark:text-primary-400">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-white">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-white">{children}</h4>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-8 rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
              <table className="min-w-full border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-primary-100 dark:bg-primary-900/50 border border-gray-300 dark:border-gray-700 px-5 py-3 text-left font-bold text-gray-900 dark:text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-700 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-gray-700 dark:text-gray-300">{children}</td>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline font-medium hover:no-underline transition-all" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-700 text-primary-700 dark:text-primary-400 px-2 py-1 rounded font-mono text-sm border border-gray-200 dark:border-gray-600">
                  {children}
                </code>
              )
            }
            return (
              <code className={className}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => (
            <pre className="bg-gray-100 dark:bg-gray-900 p-6 rounded-xl overflow-x-auto my-6 border-2 border-gray-200 dark:border-gray-700 shadow-inner">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-3 my-6 text-gray-700 dark:text-gray-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-3 my-6 text-gray-700 dark:text-gray-300">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 dark:border-primary-600 pl-6 italic my-6 text-gray-700 dark:text-gray-300 bg-primary-50 dark:bg-primary-900/20 py-4 rounded-r-lg">
              {children}
            </blockquote>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
