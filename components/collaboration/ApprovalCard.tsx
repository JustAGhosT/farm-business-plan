'use client'

import { useState } from 'react'
import { Approval, ApprovalWorkflow, ApprovalStage } from '@/types'

interface ApprovalCardProps {
  workflow: ApprovalWorkflow
  stage: ApprovalStage
  onApprove: (
    stageId: string,
    decision: 'approved' | 'rejected',
    comments: string,
    signature?: string
  ) => Promise<void>
}

export default function ApprovalCard({ workflow, stage, onApprove }: ApprovalCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [comments, setComments] = useState('')
  const [signature, setSignature] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSignature, setShowSignature] = useState(false)

  const handleApproval = async (decision: 'approved' | 'rejected') => {
    if (!comments.trim()) {
      alert('Please provide comments for your decision')
      return
    }

    // Signature validation removed - signature is optional
    // if (stage.requiresSignature && !signature.trim()) {
    //   alert('This stage requires a digital signature')
    //   return
    // }

    setIsSubmitting(true)
    try {
      await onApprove(stage.id, decision, comments, signature || undefined)
      setComments('')
      setSignature('')
      setIsExpanded(false)
    } catch (error) {
      console.error('Approval submission failed:', error)
      alert('Failed to submit approval. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const isOverdue =
    stage.deadline && new Date(stage.deadline) < new Date() && stage.status === 'pending'

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{workflow.name}</h3>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(stage.status)}`}
            >
              {stage.status.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Stage {stage.order}: {stage.name}
          </p>
        </div>
        {isOverdue && (
          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
            OVERDUE
          </span>
        )}
      </div>

      {/* Stage description not available in ApprovalStage interface */}

      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
        <div>
          <span className="font-medium">Required Approvals:</span> {stage.requiredApprovals}
        </div>
        {stage.deadline && (
          <div>
            <span className="font-medium">Deadline:</span> {formatDate(stage.deadline)}
          </div>
        )}
        {/* Signature requirement not in ApprovalStage interface */}
      </div>

      {stage.status === 'pending' && (
        <>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium mb-2"
          >
            {isExpanded ? '▼ Hide Approval Form' : '▶ Review & Approve'}
          </button>

          {isExpanded && (
            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Comments <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Provide your review comments..."
                  disabled={isSubmitting}
                />
              </div>

              {/* Optional signature field - always show */}
              {true && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <input
                      type="checkbox"
                      checked={showSignature}
                      onChange={(e) => setShowSignature(e.target.checked)}
                      className="rounded"
                    />
                    Add Digital Signature <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  {showSignature && (
                    <input
                      type="text"
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Type your full name as digital signature"
                      disabled={isSubmitting}
                    />
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleApproval('approved')}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : '✓ Approve'}
                </button>
                <button
                  onClick={() => handleApproval('rejected')}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : '✗ Reject'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {stage.status !== 'pending' && (
        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">Decision:</span> {stage.status.toUpperCase()}
        </div>
      )}
    </div>
  )
}
