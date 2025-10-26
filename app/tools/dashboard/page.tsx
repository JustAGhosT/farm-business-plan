'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Task {
  id: number
  title: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  category: string
}

export default function DashboardPage() {
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: 'Plant dragon fruit cuttings',
      status: 'completed',
      priority: 'high',
      dueDate: '2025-01-15',
      category: 'Planting',
    },
    {
      id: 2,
      title: 'Install drip irrigation',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2025-01-20',
      category: 'Infrastructure',
    },
    {
      id: 3,
      title: 'Apply organic fertilizer',
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-01-25',
      category: 'Maintenance',
    },
    {
      id: 4,
      title: 'Check pest traps',
      status: 'pending',
      priority: 'low',
      dueDate: '2025-01-22',
      category: 'Monitoring',
    },
  ])

  const stats = [
    {
      label: 'Active Tasks',
      value: tasks.filter((t) => t.status !== 'completed').length,
      icon: '📋',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Completed Tasks',
      value: tasks.filter((t) => t.status === 'completed').length,
      icon: '✅',
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'High Priority',
      value: tasks.filter((t) => t.priority === 'high').length,
      icon: '⚠️',
      color: 'bg-red-100 text-red-600',
    },
    { label: 'This Week', value: 3, icon: '📅', color: 'bg-purple-100 text-purple-600' },
  ]

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    }
    return styles[status as keyof typeof styles] || ''
  }

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
      medium: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      high: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
    }
    return styles[priority as keyof typeof styles] || ''
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
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

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Operations Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your farm activities, tasks, and milestones
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-7 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <div className={`text-4xl rounded-full p-4 ${stat.color} shadow-md`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks List */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task List</h2>
                <button className="px-5 py-2.5 bg-primary-600 dark:bg-primary-700 text-white rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105">
                  + Add Task
                </button>
              </div>

              <div className="space-y-4">
                {tasks.map((task) => (
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
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 gap-4">
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
                        {task.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-7 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                💰 Financial Overview
              </h2>
              <Link
                href="/tools/calculators/dashboard"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
              >
                View Full Dashboard →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Total Investment</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">R 0</p>
                  </div>
                  <span className="text-2xl">💰</span>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Revenue</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">R 0</p>
                  </div>
                  <span className="text-2xl">📊</span>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Net Profit</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">R 0</p>
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Avg ROI</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">0%</p>
                  </div>
                  <span className="text-2xl">⚖️</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">Recent Calculations</h3>
                <Link
                  href="/tools/reports"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                >
                  View All →
                </Link>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No calculations yet. Start by using the AI Farm Planning wizard or individual calculators.
              </div>
            </div>
          </div>

          {/* Quick Actions & Calendar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-7 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-7 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">
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
                      Plant dragon fruit cuttings
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
                      Install drip irrigation
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
                      Apply organic fertilizer
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
