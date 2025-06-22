"use client"

import { useState, useEffect } from "react"

interface CreditTransaction {
  id: string
  customer_name: string
  amount: number
  date: string
  type: "received" | "given"
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<CreditTransaction[]>([])
  const [totalCredits, setTotalCredits] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching credits data
    const mockCredits: CreditTransaction[] = [
      {
        id: "1",
        customer_name: "John Doe",
        amount: 150.0,
        date: "2024-01-15",
        type: "received",
      },
      {
        id: "2",
        customer_name: "Jane Smith",
        amount: 75.5,
        date: "2024-01-14",
        type: "received",
      },
      {
        id: "3",
        customer_name: "Bob Johnson",
        amount: 200.0,
        date: "2024-01-13",
        type: "given",
      },
      {
        id: "4",
        customer_name: "Alice Brown",
        amount: 125.25,
        date: "2024-01-12",
        type: "received",
      },
      {
        id: "5",
        customer_name: "Charlie Wilson",
        amount: 90.0,
        date: "2024-01-11",
        type: "received",
      },
    ]

    setTimeout(() => {
      setCredits(mockCredits)
      const total = mockCredits.reduce((sum, credit) => {
        return credit.type === "received" ? sum + credit.amount : sum - credit.amount
      }, 0)
      setTotalCredits(total)
      setIsLoading(false)
    }, 1000)
  }, [])

  const receivedCredits = credits.filter((c) => c.type === "received").reduce((sum, c) => sum + c.amount, 0)
  const givenCredits = credits.filter((c) => c.type === "given").reduce((sum, c) => sum + c.amount, 0)

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gradient-to-r from-green-200 to-emerald-200 rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded"></div>
            <div className="h-32 bg-gradient-to-r from-green-100 to-emerald-100 rounded"></div>
            <div className="h-32 bg-gradient-to-r from-red-100 to-pink-100 rounded"></div>
          </div>
          <div className="h-64 bg-gradient-to-r from-indigo-100 to-purple-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Credits Management
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Track your colorful credit transactions and balances</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${totalCredits.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalCredits >= 0 ? "Positive balance" : "Negative balance"}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Received</p>
                <p className="text-3xl font-bold text-green-600 mt-1">${receivedCredits.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Total credits received</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-pink-50 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Given</p>
                <p className="text-3xl font-bold text-red-600 mt-1">${givenCredits.toFixed(2)}</p>
                <p className="text-xs text-gray-500 mt-1">Total credits given</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-xl">
        <div className="card-header">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Credit Transactions
          </h2>
          <p className="text-gray-600">Recent credit transactions with customers</p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="bg-gradient-to-r from-purple-100 to-pink-100">Customer</th>
                  <th className="bg-gradient-to-r from-green-100 to-emerald-100">Amount</th>
                  <th className="bg-gradient-to-r from-blue-100 to-indigo-100">Type</th>
                  <th className="bg-gradient-to-r from-orange-100 to-red-100">Date</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50">
                    <td>
                      <span className="font-medium text-gray-800">{credit.customer_name}</span>
                    </td>
                    <td>
                      <span className={`font-bold ${credit.type === "received" ? "text-green-600" : "text-red-600"}`}>
                        {credit.type === "received" ? "+" : "-"}${credit.amount.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full font-medium text-sm ${
                          credit.type === "received"
                            ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                            : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800"
                        }`}
                      >
                        {credit.type === "received" ? "Received" : "Given"}
                      </span>
                    </td>
                    <td>
                      <span className="text-gray-600">{new Date(credit.date).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
