"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, CreditCard, Trophy, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCredits: 0,
    competitions: 0,
    revenue: 0,
  })

  useEffect(() => {
    // Simulate loading stats
    setStats({
      totalProducts: 24,
      totalCredits: 1250,
      competitions: 3,
      revenue: 15420,
    })
  }, [])

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Products</CardTitle>
            <Package className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs opacity-90">Active inventory items</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Total Credits</CardTitle>
            <CreditCard className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
            <p className="text-xs opacity-90">Available credits</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Competitions</CardTitle>
            <Trophy className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.competitions}</div>
            <p className="text-xs opacity-90">Active competitions</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 opacity-90" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue}</div>
            <p className="text-xs opacity-90">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Your latest business activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New product added</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
              <Badge variant="secondary">New</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Credit received</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
              <Badge variant="secondary">Credit</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Competition submitted</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
              <Badge variant="secondary">Competition</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 rounded-lg bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors">
              <p className="font-medium text-blue-900">Add New Product</p>
              <p className="text-sm text-blue-700">Expand your inventory</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 hover:bg-green-100 cursor-pointer transition-colors">
              <p className="font-medium text-green-900">View Credits</p>
              <p className="text-sm text-green-700">Check your credit balance</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 hover:bg-purple-100 cursor-pointer transition-colors">
              <p className="font-medium text-purple-900">Start Competition</p>
              <p className="text-sm text-purple-700">Submit a new competition</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
