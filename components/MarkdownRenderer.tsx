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
    <div className="bg-white rounded-lg shadow-lg p-8 prose prose-lg max-w-none prose-headings:text-gray-900 prose-a:text-primary-600 prose-strong:text-gray-900 prose-code:text-primary-700 prose-pre:bg-gray-100 prose-table:border-collapse prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-td:border prose-td:border-gray-300 prose-td:p-2 prose-th:p-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 mt-8 pb-2 border-b-2 border-primary-500">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mb-4 mt-8 text-primary-700">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mb-3 mt-6">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-semibold mb-2 mt-4">{children}</h4>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-primary-100 border border-gray-300 px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-2">{children}</td>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary-600 hover:text-primary-700 underline" target={href?.startsWith('http') ? '_blank' : undefined} rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}>
              {children}
            </a>
          ),
          code: ({ className, children }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="bg-gray-100 text-primary-700 px-1.5 py-0.5 rounded text-sm font-mono">
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
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto my-4">
              {children}
            </pre>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 my-4">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 my-4">{children}</ol>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary-500 pl-4 italic my-4 text-gray-700">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
