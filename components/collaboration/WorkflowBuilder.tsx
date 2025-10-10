'use client'

import { useState } from 'react'

interface WorkflowStage {
  name: string
  description: string
  required_approvals: number
  approvers: string[]
  deadline_days: number
  requires_signature: boolean
}

interface WorkflowBuilderProps {
  targetType: 'farm-plan' | 'crop-plan' | 'financial-report' | 'task' | 'document'
  targetId: string
  onSubmit: (workflow: {
    title: string
    workflow_type: 'sequential' | 'parallel'
    stages: WorkflowStage[]
  }) => Promise<void>
}

export default function WorkflowBuilder({ targetType, targetId, onSubmit }: WorkflowBuilderProps) {
  const [title, setTitle] = useState('')
  const [workflowType, setWorkflowType] = useState<'sequential' | 'parallel'>('sequential')
  const [stages, setStages] = useState<WorkflowStage[]>([
    {
      name: '',
      description: '',
      required_approvals: 1,
      approvers: [],
      deadline_days: 7,
      requires_signature: false,
    },
  ])
  const [currentApprover, setCurrentApprover] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addStage = () => {
    setStages([
      ...stages,
      {
        name: '',
        description: '',
        required_approvals: 1,
        approvers: [],
        deadline_days: 7,
        requires_signature: false,
      },
    ])
  }

  const removeStage = (index: number) => {
    if (stages.length > 1) {
      setStages(stages.filter((_, i) => i !== index))
    }
  }

  const updateStage = (index: number, field: keyof WorkflowStage, value: any) => {
    const newStages = [...stages]
    newStages[index] = { ...newStages[index], [field]: value }
    setStages(newStages)
  }

  const addApprover = (stageIndex: number, approverId: string) => {
    if (approverId && !stages[stageIndex].approvers.includes(approverId)) {
      const newStages = [...stages]
      newStages[stageIndex].approvers = [...newStages[stageIndex].approvers, approverId]
      setStages(newStages)
    }
  }

  const removeApprover = (stageIndex: number, approverId: string) => {
    const newStages = [...stages]
    newStages[stageIndex].approvers = newStages[stageIndex].approvers.filter(
      (id) => id !== approverId
    )
    setStages(newStages)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      alert('Please provide a workflow title')
      return
    }

    if (stages.some((s) => !s.name.trim())) {
      alert('All stages must have a name')
      return
    }

    if (stages.some((s) => s.approvers.length === 0)) {
      alert('All stages must have at least one approver')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        title,
        workflow_type: workflowType,
        stages,
      })
      // Reset form
      setTitle('')
      setStages([
        {
          name: '',
          description: '',
          required_approvals: 1,
          approvers: [],
          deadline_days: 7,
          requires_signature: false,
        },
      ])
    } catch (error) {
      console.error('Failed to create workflow:', error)
      alert('Failed to create workflow. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Create Approval Workflow</h3>
        <p className="text-sm text-gray-600">
          Define a multi-stage approval process for your {targetType.replace('-', ' ')}
        </p>
      </div>

      {/* Workflow Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Workflow Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g., Financial Report Q1 Approval"
          required
        />
      </div>

      {/* Workflow Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Workflow Type <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="sequential"
              checked={workflowType === 'sequential'}
              onChange={(e) => setWorkflowType(e.target.value as 'sequential' | 'parallel')}
              className="mr-2"
            />
            <div>
              <span className="font-medium">Sequential</span>
              <p className="text-xs text-gray-500">Stages complete in order</p>
            </div>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="parallel"
              checked={workflowType === 'parallel'}
              onChange={(e) => setWorkflowType(e.target.value as 'sequential' | 'parallel')}
              className="mr-2"
            />
            <div>
              <span className="font-medium">Parallel</span>
              <p className="text-xs text-gray-500">All stages proceed simultaneously</p>
            </div>
          </label>
        </div>
      </div>

      {/* Stages */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">Approval Stages</label>
          <button
            type="button"
            onClick={addStage}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            + Add Stage
          </button>
        </div>

        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Stage {index + 1}</h4>
                {stages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeStage(index)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stage Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => updateStage(index, 'name', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., Farm Manager Review"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={stage.description}
                    onChange={(e) => updateStage(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    rows={2}
                    placeholder="What should be reviewed at this stage?"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Required Approvals
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stage.required_approvals}
                      onChange={(e) =>
                        updateStage(index, 'required_approvals', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deadline (days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={stage.deadline_days}
                      onChange={(e) =>
                        updateStage(index, 'deadline_days', parseInt(e.target.value))
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={stage.requires_signature}
                      onChange={(e) => updateStage(index, 'requires_signature', e.target.checked)}
                      className="mr-2 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Require Digital Signature
                    </span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approvers <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={index === stages.indexOf(stage) ? currentApprover : ''}
                      onChange={(e) => setCurrentApprover(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="Enter user ID or email"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addApprover(index, currentApprover)
                        setCurrentApprover('')
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {stage.approvers.map((approverId) => (
                      <span
                        key={approverId}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                      >
                        {approverId}
                        <button
                          type="button"
                          onClick={() => removeApprover(index, approverId)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-2 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-md font-medium transition-colors"
        >
          {isSubmitting ? 'Creating Workflow...' : 'Create Workflow'}
        </button>
      </div>
    </form>
  )
}
