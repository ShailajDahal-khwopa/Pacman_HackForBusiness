import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, User, Calendar, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Plus, Edit2 } from "lucide-react";

interface Credit {
  id?: number; // Add id for edit
  customer_uuid: string;
  amount: number;
  due_date: string;
  paid_status?: boolean;
}

const Credits = () => {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newCredit, setNewCredit] = useState<{ customer_uuid: string; amount: number }>({
    customer_uuid: "",
    amount: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<Credit> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const businessUuid = localStorage.getItem('businessUuid');
        if (!businessUuid) {
          toast({
            title: "Error",
            description: "No business UUID found. Please log in again.",
            variant: "destructive",
          });
          return;
        }

        const response = await fetch('http://localhost:8000/credit_business/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            business_uuid: businessUuid
          }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          setCredits(data.credits);
          setTotalCredits(data.credits.reduce((sum: number, credit: Credit) => sum + credit.amount, 0));
        } else {
          toast({
            title: "Error",
            description: data.message || "Failed to fetch credits",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error fetching credits:', error);
        toast({
          title: "Error",
          description: "Failed to connect to the server",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCredits();
  }, [toast]);

  const getStatusColor = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (diffDays <= 7) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    } else {
      return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getStatusText = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'overdue';
    } else if (diffDays <= 7) {
      return 'due soon';
    } else {
      return 'active';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add Credit Handler (updated)
  const handleAddCredit = async () => {
    try {
      const businessUuid = localStorage.getItem('businessUuid');
      const response = await fetch('http://localhost:8000/credit_add/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_uuid: businessUuid,
          customer_uuid: newCredit.customer_uuid,
          amount: Number(newCredit.amount),
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: "Success", description: "Credit added." });
        setIsAdding(false);
        setNewCredit({ customer_uuid: "", amount: 0 });
        setIsLoading(true);
        setTimeout(() => window.location.reload(), 500); // or refetchCredits()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to add credit", variant: "destructive" });
    }
  };

  // Edit Credit Handler
  const handleEditCredit = (credit: Credit) => {
    setEditingId(credit.id!);
    setEditData({ ...credit });
  };

  const handleSaveEdit = async () => {
    if (!editData || !editingId) return;
    try {
      const response = await fetch('http://localhost:8000/credit_edit/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credit_id: editingId,
          amount: editData.amount,
          due_date: editData.due_date,
          paid_status: editData.paid_status,
        }),
      });
      const data = await response.json();
      if (data.status === 'success') {
        toast({ title: "Success", description: "Credit updated." });
        setEditingId(null);
        setEditData(null);
        setIsLoading(true);
        setTimeout(() => window.location.reload(), 500); // or refetchCredits()
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "Failed to update credit", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditData(null);
    setNewCredit({ customer_uuid: "", amount: 0 });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Management</h1>
          <p className="text-gray-600 mt-2">Track and manage customer credits and payment history</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">₹{totalCredits.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Credits</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{credits.length}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-green-600">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{credits
                    .filter(c => new Date(c.due_date) < new Date())
                    .reduce((sum, c) => sum + c.amount, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Credits Table */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Credit
          </Button>
        </div>
        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Credit History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Customer ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Due Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="border-b border-gray-100 bg-blue-50">
                      <td className="py-3 px-4">
                        <Input
                          value={newCredit.customer_uuid}
                          onChange={e => setNewCredit(prev => ({ ...prev, customer_uuid: e.target.value }))}
                          placeholder="Customer UUID"
                          className="border-blue-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={newCredit.amount}
                          onChange={e => setNewCredit(prev => ({ ...prev, amount: Number(e.target.value) }))}
                          placeholder="Amount"
                          className="border-blue-200"
                        />
                      </td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4"></td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAddCredit} className="bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {credits.map((credit, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        {editingId === credit.id ? (
                          <Input
                            value={editData?.customer_uuid || ""}
                            onChange={e => setEditData(prev => prev ? { ...prev, customer_uuid: e.target.value } : null)}
                            className="border-blue-200"
                          />
                        ) : (
                          <span className="font-medium text-gray-900 font-mono text-sm">{credit.customer_uuid.slice(0, 8)}...</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === credit.id ? (
                          <Input
                            type="number"
                            value={editData?.amount || ""}
                            onChange={e => setEditData(prev => prev ? { ...prev, amount: Number(e.target.value) } : null)}
                            className="border-blue-200"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-gray-900">₹{credit.amount.toLocaleString()}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === credit.id ? (
                          <Input
                            type="date"
                            value={editData?.due_date?.slice(0, 10) || ""}
                            onChange={e => setEditData(prev => prev ? { ...prev, due_date: e.target.value } : null)}
                            className="border-blue-200"
                          />
                        ) : (
                          <span className="text-gray-600">{formatDate(credit.due_date)}</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId === credit.id ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Badge className={`${getStatusColor(credit.due_date)} capitalize`}>
                            {getStatusText(credit.due_date)}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {editingId !== credit.id && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditCredit(credit)}
                            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {credits.length === 0 && (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No credits found</p>
                  <p className="text-sm text-gray-400 mt-2">Credit transactions will appear here when customers make purchases on credit</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Credits;
