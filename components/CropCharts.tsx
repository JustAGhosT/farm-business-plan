'use client'

import type { PieLabelRenderProps } from 'recharts'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COLORS } from '@/lib/theme-colors'

interface CropDistributionData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface CropChartsProps {
  cropDistribution?: CropDistributionData[]
  revenueData?: any[]
  costsData?: any[]
  maxDataPoints?: number // Limit data points for performance
}

export function CropCharts({
  cropDistribution = [],
  revenueData = [],
  costsData = [],
  maxDataPoints = 100, // Default limit
}: CropChartsProps) {
  // Apply data point limit for performance
  const limitedRevenueData = revenueData.slice(0, maxDataPoints)
  const limitedCostsData = costsData.slice(0, maxDataPoints)
  // Custom label renderer for pie chart
  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props

    if (
      cx === undefined ||
      cy === undefined ||
      midAngle === undefined ||
      innerRadius === undefined ||
      outerRadius === undefined ||
      percent === undefined
    ) {
      return null
    }

    const RADIAN = Math.PI / 180
    const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5
    const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN)
    const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > Number(cx) ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} ${(Number(percent) * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-8">
      {/* Crop Distribution Pie Chart */}
      {cropDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Revenue Bar Chart */}
      {limitedRevenueData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Revenue by Crop
            {revenueData.length > maxDataPoints && (
              <span className="text-sm text-gray-500 ml-2">
                (Showing {maxDataPoints} of {revenueData.length} items)
              </span>
            )}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={limitedRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Costs Line Chart */}
      {limitedCostsData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Costs Over Time
            {costsData.length > maxDataPoints && (
              <span className="text-sm text-gray-500 ml-2">
                (Showing {maxDataPoints} of {costsData.length} items)
              </span>
            )}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={limitedCostsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="costs" stroke="#FF8042" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
