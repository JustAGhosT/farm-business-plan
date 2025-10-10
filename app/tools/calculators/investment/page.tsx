'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FundingSource {
  name: string
  amount: string
}

export default function InvestmentCalculator() {
  const [investment, setInvestment] = useState({
    landPrep: '',
    infrastructure: '',
    equipment: '',
    initialInputs: '',
    workingCapital: '',
  })

  const [fundingSources, setFundingSources] = useState<FundingSource[]>([
    { name: 'Personal Savings', amount: '' },
    { name: 'Bank Loan', amount: '' },
  ])

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvestment({
      ...investment,
      [e.target.name]: e.target.value,
    })
  }

  const handleFundingChange = (index: number, value: string) => {
    const newSources = [...fundingSources]
    newSources[index].amount = value
    setFundingSources(newSources)
  }

  const addFundingSource = () => {
    setFundingSources([...fundingSources, { name: '', amount: '' }])
  }

  const totalInvestment = Object.values(investment).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  )

  const totalFunding = fundingSources.reduce(
    (sum, source) => sum + (parseFloat(source.amount) || 0),
    0
  )

  const fundingGap = totalInvestment - totalFunding

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/tools/calculators"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Calculators
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center mb-6">
            <span className="text-4xl mr-4">💰</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Investment Calculator</h1>
              <p className="text-gray-600">Plan your startup investment and funding requirements</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Investment Breakdown */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Investment Breakdown</h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="landPrep"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Land Preparation (ZAR)
                  </label>
                  <input
                    type="number"
                    id="landPrep"
                    name="landPrep"
                    value={investment.landPrep}
                    onChange={handleInvestmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 50000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Clearing, soil testing, amendments</p>
                </div>

                <div>
                  <label
                    htmlFor="infrastructure"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Infrastructure (ZAR)
                  </label>
                  <input
                    type="number"
                    id="infrastructure"
                    name="infrastructure"
                    value={investment.infrastructure}
                    onChange={handleInvestmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 150000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Irrigation, fencing, structures</p>
                </div>

                <div>
                  <label
                    htmlFor="equipment"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Equipment & Tools (ZAR)
                  </label>
                  <input
                    type="number"
                    id="equipment"
                    name="equipment"
                    value={investment.equipment}
                    onChange={handleInvestmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 80000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Tractors, implements, hand tools</p>
                </div>

                <div>
                  <label
                    htmlFor="initialInputs"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Initial Inputs (ZAR)
                  </label>
                  <input
                    type="number"
                    id="initialInputs"
                    name="initialInputs"
                    value={investment.initialInputs}
                    onChange={handleInvestmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 30000"
                  />
                  <p className="text-xs text-gray-500 mt-1">Seeds, fertilizers, pesticides</p>
                </div>

                <div>
                  <label
                    htmlFor="workingCapital"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Working Capital (ZAR)
                  </label>
                  <input
                    type="number"
                    id="workingCapital"
                    name="workingCapital"
                    value={investment.workingCapital}
                    onChange={handleInvestmentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 40000"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Operating expenses for first 3-6 months
                  </p>
                </div>

                <div className="bg-primary-50 rounded-lg p-4 border-2 border-primary-200">
                  <div className="text-sm text-gray-600 mb-1">Total Investment Required</div>
                  <div className="text-3xl font-bold text-primary-700">
                    {formatCurrency(totalInvestment)}
                  </div>
                </div>
              </div>
            </div>

            {/* Funding Sources */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Funding Sources</h2>

              <div className="space-y-4 mb-4">
                {fundingSources.map((source, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={source.name}
                      onChange={(e) => {
                        const newSources = [...fundingSources]
                        newSources[index].name = e.target.value
                        setFundingSources(newSources)
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Source name"
                    />
                    <input
                      type="number"
                      value={source.amount}
                      onChange={(e) => handleFundingChange(index, e.target.value)}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Amount"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={addFundingSource}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-700 transition-colors"
              >
                + Add Funding Source
              </button>

              <div className="mt-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Total Funding Secured</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalFunding)}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {totalInvestment > 0
                      ? `${((totalFunding / totalInvestment) * 100).toFixed(1)}% of required`
                      : '0% of required'}
                  </div>
                </div>

                <div
                  className={`rounded-lg p-4 border-2 ${fundingGap > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                >
                  <div className="text-sm text-gray-600 mb-1">Funding Gap</div>
                  <div
                    className={`text-2xl font-bold ${fundingGap > 0 ? 'text-red-700' : 'text-green-700'}`}
                  >
                    {formatCurrency(Math.abs(fundingGap))}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {fundingGap > 0 ? 'Additional funding needed' : 'Fully funded'}
                  </div>
                </div>

                {totalInvestment > 0 && (
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">Funding Breakdown</h3>
                    {fundingSources
                      .filter((s) => parseFloat(s.amount) > 0)
                      .map((source, index) => {
                        const amount = parseFloat(source.amount) || 0
                        const percentage = (amount / totalInvestment) * 100
                        return (
                          <div key={index} className="mb-2">
                            <div className="flex justify-between text-sm mb-1">
                              <span>{source.name || 'Unnamed Source'}</span>
                              <span className="font-medium">{percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Financing Tips</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Include 10-15% contingency in your investment plan</li>
              <li>Working capital should cover 3-6 months of operating expenses</li>
              <li>Explore agricultural development banks and government grants</li>
              <li>Consider phased investment to reduce upfront capital needs</li>
              <li>Get multiple quotes for equipment and infrastructure</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
