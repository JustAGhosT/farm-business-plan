'use client'

import WizardWrapper from '@/components/WizardWrapper'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function LoanCalculator() {
  const [values, setValues] = useState({
    principal: '',
    interestRate: '',
    termYears: '',
  })

  const [results, setResults] = useState<{
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
    schedule: {
      month: number
      payment: number
      principal: number
      interest: number
      balance: number
    }[]
  } | null>(null)

  const calculateLoan = () => {
    const P = parseFloat(values.principal) || 0
    const annualRate = parseFloat(values.interestRate) / 100
    const monthlyRate = annualRate / 12
    const n = (parseFloat(values.termYears) || 0) * 12

    if (P <= 0 || monthlyRate <= 0 || n <= 0) {
      setResults(null)
      return
    }

    // Monthly payment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    const monthlyPayment =
      (P * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)
    const totalPayment = monthlyPayment * n
    const totalInterest = totalPayment - P

    // Generate full amortization schedule
    const schedule = []
    let balance = P

    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * monthlyRate
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment

      schedule.push({
        month,
        payment: monthlyPayment,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
      })
    }

    setResults({
      monthlyPayment,
      totalPayment,
      totalInterest,
      schedule,
    })
  }

  const [showFullSchedule, setShowFullSchedule] = useState(false)

  useEffect(() => {
    if (values.principal && values.interestRate && values.termYears) {
      calculateLoan()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [e.target.name]: e.target.value,
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleNext = () => {
    const wizardData = JSON.parse(sessionStorage.getItem('calculatorWizardData') || '{}')
    wizardData.loan = {
      values,
      results,
    }
    sessionStorage.setItem('calculatorWizardData', JSON.stringify(wizardData))
  }

  return (
    <WizardWrapper
      title="Loan Calculator"
      description="Calculate loan payments and interest costs."
      step={7}
      isFormValid={!!results}
      onNext={handleNext}
    >
      <div className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Loan Details</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="principal"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Loan Amount (ZAR) *
                </label>
                <input
                  type="number"
                  id="principal"
                  name="principal"
                  value={values.principal}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 200000"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Total amount you want to borrow
                </p>
              </div>

              <div>
                <label
                  htmlFor="interestRate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Annual Interest Rate (%) *
                </label>
                <input
                  type="number"
                  id="interestRate"
                  name="interestRate"
                  value={values.interestRate}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 11.5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Annual interest rate offered by lender
                </p>
              </div>

              <div>
                <label
                  htmlFor="termYears"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Loan Term (Years) *
                </label>
                <input
                  type="number"
                  id="termYears"
                  name="termYears"
                  value={values.termYears}
                  onChange={handleChange}
                  min="1"
                  max="30"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g., 5"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Number of years to repay the loan
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  Typical SA Rates
                </h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Commercial banks: 10-13% for agriculture</li>
                  <li>• Land Bank: 8-11% for farming loans</li>
                  <li>• Microfinance: 15-20% for small loans</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Payment Summary</h2>

            {results ? (
              <div className="space-y-4">
                <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 border-2 border-primary-200 dark:border-primary-700">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Monthly Payment
                  </div>
                  <div className="text-3xl font-bold text-primary-700 dark:text-primary-400">
                    {formatCurrency(results.monthlyPayment)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Fixed monthly installment
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Total Amount Paid
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(results.totalPayment)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Over {values.termYears} years
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                    Total Interest Paid
                  </div>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {formatCurrency(results.totalInterest)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Cost of borrowing
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Cost Breakdown
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm dark:text-gray-300">
                      <span>Principal</span>
                      <span className="font-medium">
                        {formatCurrency(parseFloat(values.principal))}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${(parseFloat(values.principal) / results.totalPayment) * 100}%`,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm mt-3 dark:text-gray-300">
                      <span>Interest</span>
                      <span className="font-medium">{formatCurrency(results.totalInterest)}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{
                          width: `${(results.totalInterest / results.totalPayment) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Affordability Check:</strong> Your monthly payment should not exceed
                    30-40% of your expected monthly income.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p>Enter loan details to calculate payments</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </WizardWrapper>
  )
}
