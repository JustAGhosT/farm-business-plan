'use client'

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { CropChartData, CROP_COLORS, prepareCropComparisonData } from '@/lib/chartUtils'

interface CropChartsProps {
  crops: Array<{ name: string; percentage: number }>
  years?: number
  totalHectares?: number
}

export default function CropCharts({ crops, years = 5, totalHectares = 10 }: CropChartsProps) {
  const chartData = prepareCropComparisonData(crops, years, totalHectares)

  // Prepare allocation data for pie chart
  const allocationData = crops
    .filter((c) => c.name.trim() !== '')
    .map((crop) => ({
      name: crop.name,
      value: crop.percentage,
    }))

  // Format currency for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Custom tooltip for financial charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Add crops with names to see visual charts
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Crop Allocation Pie Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🥧 Crop Allocation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CROP_COLORS[index % CROP_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue vs Costs Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💰 Revenue vs Costs ({years}-Year Projection)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
            <Bar dataKey="costs" fill="#ef4444" name="Costs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📈 Profit Comparison ({years}-Year Total)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `R${(value / 1000).toFixed(0)}k`} />
            <YAxis dataKey="name" type="category" width={120} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="profit" fill="#8b5cf6" name="Profit">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.profit > 0 ? '#10b981' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ROI Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Return on Investment (ROI)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
            <Tooltip
              formatter={(value: number) => `${value.toFixed(2)}%`}
              labelStyle={{ color: '#000' }}
            />
            <Bar dataKey="roi" fill="#3b82f6" name="ROI %">
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.roi > 50 ? '#10b981' : entry.roi > 0 ? '#f59e0b' : '#ef4444'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>Excellent (&gt;50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span>Good (0-50%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>Negative (&lt;0%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Summary Table</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Crop
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Allocation
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Revenue
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Costs
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Profit
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  ROI
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Water
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.map((crop, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{crop.name}</td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {crop.percentage.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {formatCurrency(crop.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-700">
                    {formatCurrency(crop.costs)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right font-semibold ${
                      crop.profit > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(crop.profit)}
                  </td>
                  <td
                    className={`px-4 py-3 text-sm text-right font-semibold ${
                      crop.roi > 50
                        ? 'text-green-600'
                        : crop.roi > 0
                          ? 'text-amber-600'
                          : 'text-red-600'
                    }`}
                  >
                    {crop.roi.toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-sm text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        crop.waterNeeds === 'low'
                          ? 'bg-yellow-100 text-yellow-800'
                          : crop.waterNeeds === 'medium'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {crop.waterNeeds}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
