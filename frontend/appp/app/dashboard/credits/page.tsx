"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, TrendingUp, Calendar, DollarSign } from "lucide-react"

interface Credit {
  id: string
  customer_name: string
  amount: number
  date: string
  status: string
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([])
  const [totalCredits, setTotalCredits] = useState(0)
  const [monthlyCredits, setMonthlyCredits] = useState(0)

  useEffect(() => {
    // Simulate fetching credits data
    const mockCredits: Credit[] = [
      {
        id: "1",
        customer_name: "John Doe",
        amount: 250,
        date: "2024-01-15",
        status: "active",
      },
      {
        id: "2",
        customer_name: "Jane Smith",
        amount: 180,
        date: "2024-01-14",
        status: "active",
      },
      {
        id: "3",
        customer_name: "Mike Johnson",
        amount: 320,
        date: "2024-01-13",
        status: "redeemed",
      },
      {
        id: "4",
        customer_name: "Sarah Wilson",
        amount: 150,
        date: "2024-01-12",
        status: "active",
      },
      {
        id: "5",
        customer_name: "David Brown",
        amount: 200,
        date: "2024-01-11",
        status: "active",
      },
    ]

    setCredits(mockCredits)
    setTotalCredits(mockCredits.reduce((sum, credit) => sum + credit.amount, 0))
    setMonthlyCredits(
      mockCredits.filter((credit) => credit.status === "active").reduce((sum, credit) => sum + credit.amount, 0),
    )
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "redeemed":
        return "secondary"
      default:
        return "destructive"
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Credits Management
        </h1>
        <p className="text-gray-600 mt-2">Track and manage customer credits for your business</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Credits</CardTitle>
            <DollarSign className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCredits}</div>
            <p className="text-xs opacity-90">All time credits issued</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Active Credits</CardTitle>
            <CreditCard className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlyCredits}</div>
            <p className="text-xs opacity-90">Available for redemption</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits.length}</div>
            <p className="text-xs opacity-90">Credits issued</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Credit History</span>
          </CardTitle>
          <CardDescription>View all credits issued to customers and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          {credits.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No credits found</h3>
              <p className="text-gray-500">Credits will appear here once customers start earning them.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {credits.map((credit) => (
                <div
                  key={credit.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {credit.customer_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{credit.customer_name}</p>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(credit.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold text-lg">${credit.amount}</p>
                      <Badge variant={getStatusColor(credit.status)}>
                        {credit.status.charAt(0).toUpperCase() + credit.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
