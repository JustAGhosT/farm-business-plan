'use client'

import { ApprovalWorkflow, ApprovalStage, Approval } from '@/types'

interface WorkflowProgressProps {
  workflow: ApprovalWorkflow
  stages: ApprovalStage[]
  approvals: Approval[]
}

export default function WorkflowProgress({ workflow, stages, approvals }: WorkflowProgressProps) {
  const getStageStatus = (stage: ApprovalStage) => {
    const stageApprovals = approvals.filter(a => a.stage_id === stage.id)
    const approvedCount = stageApprovals.filter(a => a.status === 'approved').length
    
    if (stage.status === 'approved') return 'complete'
    if (stage.status === 'rejected') return 'rejected'
    if (stage.status === 'in-progress' || approvedCount > 0) return 'in-progress'
    return 'pending'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-500'
      case 'rejected': return 'bg-red-500'
      case 'in-progress': return 'bg-blue-500'
      default: return 'bg-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )
      case 'rejected':
        return (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )
      case 'in-progress':
        return <span className="text-white text-xs font-bold">...</span>
      default:
        return <span className="text-gray-600 text-xs">{status === 'pending' ? '' : '○'}</span>
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-1">{workflow.title}</h3>
        <p className="text-sm text-gray-600">
          Workflow Type: <span className="font-medium">{workflow.workflow_type}</span>
        </p>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 -z-10" />
        
        {/* Stages */}
        <div className="flex justify-between">
          {stages.sort((a, b) => a.order - b.order).map((stage, index) => {
            const status = getStageStatus(stage)
            const stageApprovals = approvals.filter(a => a.stage_id === stage.id)
            const approvedCount = stageApprovals.filter(a => a.status === 'approved').length
            
            return (
              <div key={stage.id} className="flex flex-col items-center" style={{ width: `${100 / stages.length}%` }}>
                {/* Stage Circle */}
                <div className={`w-10 h-10 rounded-full ${getStatusColor(status)} flex items-center justify-center mb-2 shadow-md relative z-10`}>
                  {getStatusIcon(status)}
                </div>
                
                {/* Stage Info */}
                <div className="text-center px-2">
                  <p className="text-sm font-medium mb-1">{stage.name}</p>
                  <p className="text-xs text-gray-500">
                    {approvedCount}/{stage.required_approvals} approved
                  </p>
                  {stage.deadline && (
                    <p className="text-xs text-gray-400 mt-1">
                      Due: {formatDate(stage.deadline)}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Overall Status */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Overall Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            workflow.status === 'approved' ? 'bg-green-100 text-green-800' :
            workflow.status === 'rejected' ? 'bg-red-100 text-red-800' :
            workflow.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {workflow.status.replace('-', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
