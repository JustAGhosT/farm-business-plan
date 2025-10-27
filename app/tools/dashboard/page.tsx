'use client'

import { useFarmPlans, useFinancialData, useTasks } from '@/lib/hooks'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed' | 'high-priority'>(
    'all'
  )
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status'>('date')

  // Fetch data from database
  const {
    farmPlans,
    loading: loadingFarms,
    error: errorFarms,
    refetch: refetchFarms,
  } = useFarmPlans()
  const {
    tasks,
    loading: loadingTasks,
    error: errorTasks,
    refetch: refetchTasks,
  } = useTasks(selectedFarmId ? { farm_plan_id: selectedFarmId } : undefined)
  const {
    financialData,
    loading: loadingFinancials,
    error: errorFinancials,
    refetch: refetchFinancials,
  } = useFinancialData(selectedFarmId ? { farm_plan_id: selectedFarmId } : undefined)

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        handleRetry()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show error notifications
  useEffect(() => {
    if (errorFarms) {
      setNotification({ type: 'error', message: 'Failed to load farms' })
    }
    if (errorTasks) {
      setNotification({ type: 'error', message: 'Failed to load tasks' })
    }
    if (errorFinancials) {
      setNotification({ type: 'error', message: 'Failed to load financial data' })
    }
  }, [errorFarms, errorTasks, errorFinancials])

  const handleRetry = async () => {
    setNotification({ type: 'info', message: 'Refreshing data...' })
    await Promise.all([refetchFarms(), refetchTasks(), refetchFinancials()])
    setNotification({ type: 'success', message: 'Data refreshed!' })
  }

  // Filter and sort tasks
  let filteredTasks = [...tasks]

  if (taskFilter === 'active') {
    filteredTasks = filteredTasks.filter((t) => t.status !== 'completed')
  } else if (taskFilter === 'completed') {
    filteredTasks = filteredTasks.filter((t) => t.status === 'completed')
  } else if (taskFilter === 'high-priority') {
    filteredTasks = filteredTasks.filter((t) => t.priority === 'high' || t.priority === 'critical')
  }

  // Sort tasks
  filteredTasks.sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = a.due_date ? new Date(a.due_date).getTime() : 0
      const dateB = b.due_date ? new Date(b.due_date).getTime() : 0
      return dateB - dateA
    } else if (sortBy === 'priority') {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return (
        priorityOrder[b.priority as keyof typeof priorityOrder] -
        priorityOrder[a.priority as keyof typeof priorityOrder]
      )
    } else {
      const statusOrder = { completed: 0, 'in-progress': 1, pending: 2 }
      return (
        statusOrder[b.status as keyof typeof statusOrder] -
        statusOrder[a.status as keyof typeof statusOrder]
      )
    }
  })

  // Calculate stats from real data
  const activeTasks = tasks.filter((t) => t.status !== 'completed')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const highPriorityTasks = tasks.filter((t) => t.priority === 'high' || t.priority === 'critical')

  // Calculate financial metrics
  const totalInvestment =
    financialData.reduce(
      (sum, f) => sum + (parseFloat(f.initial_investment?.toString() || '0') || 0),
      0
    ) || 0
  const totalRevenue =
    financialData.reduce(
      (sum, f) => sum + (parseFloat(f.projected_revenue?.toString() || '0') || 0),
      0
    ) || 0
  const netProfit = totalRevenue - totalInvestment
  const avgROI = totalInvestment > 0 ? ((netProfit / totalInvestment) * 100).toFixed(1) : '0'

  // Interactive stats - click to filter
  const handleStatClick = (filterType: 'active' | 'completed' | 'high-priority') => {
    setTaskFilter(filterType === 'high-priority' ? 'high-priority' : filterType)
  }

  // Get current date/time info
  const currentDate = new Date()
  const currentTime = currentDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
  const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions)

  const stats = [
    {
      label: 'Active Tasks',
      value: activeTasks.length,
      icon: '📋',
      color: 'bg-blue-100 text-blue-600',
      hoverColor: 'hover:bg-blue-200',
      onClick: () => handleStatClick('active'),
      clickable: true,
    },
    {
      label: 'Completed Tasks',
      value: completedTasks.length,
      icon: '✅',
      color: 'bg-green-100 text-green-600',
      hoverColor: 'hover:bg-green-200',
      onClick: () => handleStatClick('completed'),
      clickable: true,
    },
    {
      label: 'High Priority',
      value: highPriorityTasks.length,
      icon: '⚠️',
      color: 'bg-red-100 text-red-600',
      hoverColor: 'hover:bg-red-200',
      onClick: () => handleStatClick('high-priority'),
      clickable: true,
    },
    {
      label: 'My Farms',
      value: farmPlans.length,
      icon: '🏡',
      color: 'bg-purple-100 text-purple-600',
      hoverColor: 'hover:bg-purple-200',
      clickable: false,
    },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    }
    return styles[status as keyof typeof styles] || ''
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      critical: 'bg-red-200 dark:bg-red-900/50 text-red-900 dark:text-red-200',
    }
    return styles[priority as keyof typeof styles] || ''
  }

  const loading = loadingFarms || loadingTasks || loadingFinancials

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`mb-6 rounded-lg p-4 flex items-center justify-between shadow-lg ${
              notification.type === 'error'
                ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                : notification.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <div className="flex items-center">
              {notification.type === 'error' && (
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {notification.type === 'success' && (
                <svg
                  className="w-5 h-5 text-green-600 dark:text-green-400 mr-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {notification.type === 'info' && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400 mr-3"></div>
              )}
              <p
                className={`font-medium ${
                  notification.type === 'error'
                    ? 'text-red-800 dark:text-red-300'
                    : notification.type === 'success'
                      ? 'text-green-800 dark:text-green-300'
                      : 'text-blue-800 dark:text-blue-300'
                }`}
              >
                {notification.message}
              </p>
            </div>
            {notification.type === 'error' && (
              <button
                onClick={handleRetry}
                className="ml-4 px-3 py-1 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition-colors"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Dismiss notification"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-8 transition-all font-medium group"
        >
          <svg
            className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Home
        </Link>

        {/* Improved Header with Time Context */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  Operations Dashboard
                </h1>
              </div>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 mb-2">
                {formattedDate} • {currentTime}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Track your farm activities, tasks, and milestones
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                title="Refresh data (Ctrl+R)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="farm-select"
                  className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
                >
                  Farm:
                </label>
                <select
                  id="farm-select"
                  value={selectedFarmId || ''}
                  onChange={(e) => setSelectedFarmId(e.target.value || null)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-0"
                >
                  <option value="">All Farms</option>
                  {farmPlans.map((farm) => (
                    <option key={farm.id} value={farm.id}>
                      {farm.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {stats.map((stat, index) => (
            <button
              key={index}
              onClick={stat.clickable ? stat.onClick : undefined}
              className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-all duration-300 ${
                stat.clickable
                  ? 'hover:shadow-xl transform hover:-translate-y-1 cursor-pointer'
                  : 'cursor-default'
              } ${stat.clickable ? stat.hoverColor : ''} ${
                taskFilter ===
                (stat.label === 'Active Tasks'
                  ? 'active'
                  : stat.label === 'Completed Tasks'
                    ? 'completed'
                    : stat.label === 'High Priority'
                      ? 'high-priority'
                      : '')
                  ? 'ring-2 ring-primary-500 border-primary-500'
                  : ''
              }`}
              aria-label={stat.clickable ? `Filter by ${stat.label}` : stat.label}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-1.5 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  {stat.clickable && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to filter</p>
                  )}
                </div>
                <div className={`text-3xl md:text-4xl rounded-full p-3 ${stat.color} shadow-md`}>
                  {stat.icon}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Main Content Grid - Improved Layout */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Tasks List - Takes 3 columns */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task List</h2>
                  <button
                    onClick={() =>
                      setNotification({ type: 'info', message: 'Task creation coming soon!' })
                    }
                    className="px-5 py-2.5 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                    aria-label="Add new task"
                  >
                    + Add Task
                  </button>
                </div>

                {/* Filter and Sort Controls */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filter:
                    </label>
                    <select
                      value={taskFilter}
                      onChange={(e) => setTaskFilter(e.target.value as any)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-label="Filter tasks"
                    >
                      <option value="all">All Tasks</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="high-priority">High Priority</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      aria-label="Sort tasks"
                    >
                      <option value="date">Date</option>
                      <option value="priority">Priority</option>
                      <option value="status">Status</option>
                    </select>
                  </div>
                  <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-4">Loading tasks...</p>
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📋</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {selectedFarmId ? 'No tasks yet' : 'No tasks to display'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                      {selectedFarmId
                        ? 'Get started by creating your first task. Track planting, maintenance, and other farm activities to stay organized.'
                        : 'Select a farm from the dropdown above to view its tasks, or create a new farm plan using the AI Wizard.'}
                    </p>
                    {selectedFarmId && (
                      <Link
                        href="/tools/dashboard"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Create Task
                      </Link>
                    )}
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {task.title}
                        </h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityBadge(task.priority)}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadge(task.status)}`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                      {(task.category || task.due_date) && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-4">
                          {task.category && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                              {task.category}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-1.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Financial Overview & Quick Actions Sidebar - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Overview - More Prominent */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl shadow-xl p-6 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-2xl">💰</span> Financial Overview
                </h2>
                <Link
                  href="/tools/reports"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                >
                  View All →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        Total Investment
                      </p>
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        R {totalInvestment.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-2xl">💰</span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        R {totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-2xl">📊</span>
                  </div>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Net Profit
                      </p>
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        R {netProfit.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-2xl">📈</span>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                        Avg ROI
                      </p>
                      <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                        {avgROI}%
                      </p>
                    </div>
                    <span className="text-2xl">⚖️</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Recent Calculations
                  </h3>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  No calculations yet. Start by using the AI Farm Planning wizard.
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/tools/ai-wizard"
                  className="block w-full px-5 py-3 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-all duration-300 text-center font-bold shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  🤖 AI Farm Planning
                </Link>
                <Link
                  href="/tools/calculators"
                  className="block w-full px-5 py-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/50 transition-all duration-300 text-center font-bold shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  💰 Financial Tools
                </Link>
                <Link
                  href="/tools/templates"
                  className="block w-full px-5 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all duration-300 text-center font-bold shadow-sm hover:shadow-md transform hover:scale-105"
                >
                  📚 Browse Templates
                </Link>
                <button className="w-full px-5 py-3 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all duration-300 font-bold shadow-sm hover:shadow-md transform hover:scale-105">
                  📊 Export Report
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start group">
                  <div className="bg-green-100 dark:bg-green-900/50 rounded-full p-2.5 mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Task Completed
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tasks.length > 0 && tasks[0].title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2.5 mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Task Started</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tasks.length > 1 && tasks[1].title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">5 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-yellow-100 dark:bg-yellow-900/50 rounded-full p-2.5 mr-3 shadow-sm group-hover:shadow-md transition-shadow">
                    <svg
                      className="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Task Added</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {tasks.length > 2 && tasks[2].title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
