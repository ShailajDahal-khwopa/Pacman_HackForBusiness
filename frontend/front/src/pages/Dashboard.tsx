
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from "@/components/ui/card";
import { Package, CreditCard, TrendingUp, Users } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCredits: 0,
    totalValue: 0,
  });

  useEffect(() => {
    // Fetch dashboard stats
    const fetchStats = async () => {
      const uuid = localStorage.getItem('businessUuid');
      if (!uuid) return;

      try {
        // Fetch inventory data
        const inventoryResponse = await fetch('http://localhost:8000/view/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uuid }),
        });

        const inventoryData = await inventoryResponse.json();
        if (inventoryData.status === 'success') {
          const products = inventoryData.stocks || [];
          const totalValue = products.reduce((sum: number, product: any) => 
            sum + (product.price * product.quantity), 0
          );
          
          setStats(prev => ({
            ...prev,
            totalProducts: products.length,
            totalValue: totalValue,
          }));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: Package,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Total Inventory Value",
      value: `₹${stats.totalValue.toLocaleString()}`,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      title: "Active Credits",
      value: stats.totalCredits,
      icon: CreditCard,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "Business Status",
      value: "Active",
      icon: Users,
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your business.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index} className="p-6 border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Manage Inventory</h4>
                <p className="text-sm text-blue-700 mt-1">Add, edit, or remove products from your inventory</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-900">View Credits</h4>
                <p className="text-sm text-green-700 mt-1">Track customer credits and payment history</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-medium text-purple-900">Competition Analysis</h4>
                <p className="text-sm text-purple-700 mt-1">Compare your products with competitors</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">System online</p>
                  <p className="text-xs text-gray-500">Your business dashboard is active</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Inventory loaded</p>
                  <p className="text-xs text-gray-500">Product data synchronized</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
