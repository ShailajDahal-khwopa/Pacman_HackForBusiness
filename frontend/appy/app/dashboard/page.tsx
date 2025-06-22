"use client"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Inventory",
      value: "245",
      subtitle: "Items in stock",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Total Credits",
      value: "$12,450",
      subtitle: "Available credits",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      title: "Competitions",
      value: "8",
      subtitle: "Active competitions",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Analytics",
      value: "+12%",
      subtitle: "Growth this month",
      icon: (
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
  ]

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Welcome to your colorful business dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`card bg-gradient-to-br ${stat.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="card-content">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.gradient} text-white shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-xl">
          <div className="card-header">
            <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quick Actions
            </h3>
            <p className="text-gray-600">Manage your business efficiently</p>
          </div>
          <div className="card-content space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
              <p className="text-gray-700">Add new inventory items</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <p className="text-gray-700">View credit transactions</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <p className="text-gray-700">Start new competitions</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
              <p className="text-gray-700">Analyze business performance</p>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-xl">
          <div className="card-header">
            <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Recent Activity
            </h3>
            <p className="text-gray-600">Latest updates from your business</p>
          </div>
          <div className="card-content space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-gray-700">New inventory item added</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-700">Credit transaction completed</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <p className="text-gray-700">Competition results available</p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-700">Monthly report generated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
