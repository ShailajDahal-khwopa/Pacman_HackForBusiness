"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
// Remove useToast import
// import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Save, X, Package } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
// Import Sonner toast
import { toast } from "sonner"

interface Stock {
  uuid: string
  product_name: string
  price: number
  quantity: number
}

export default function InventoryPage() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Stock>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [newProduct, setNewProduct] = useState({
    product_name: "",
    price: "",
    quantity: "",
  })
  // Remove useToast hook
  // const { toast } = useToast()

  const fetchStocks = async () => {
    try {
      const uuid = localStorage.getItem("userUuid")
      if (!uuid) return

      const response = await fetch("/api/view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid }),
      })

      const data = await response.json()
      if (data.status === "success") {
        setStocks(data.stocks)
      }
    } catch (error) {
      toast.error("Failed to fetch inventory", {
        description: "Error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()
  }, [])

  const handleEdit = (stock: Stock) => {
    setEditingId(stock.uuid)
    setEditData(stock)
  }

  const handleSave = async () => {
    try {
      const uuid = localStorage.getItem("userUuid")
      if (!uuid || !editingId) return

      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid,
          product_name: editData.product_name,
          price: editData.price,
          quantity: editData.quantity,
        }),
      })

      const data = await response.json()
      if (data.status === "success") {
        toast.success("Product updated successfully", {
          description: "Success",
        })
        fetchStocks()
        setEditingId(null)
        setEditData({})
      }
    } catch (error) {
      toast.error("Failed to update product", {
        description: "Error",
      })
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleAddProduct = async () => {
    try {
      const uuid = localStorage.getItem("userUuid")
      if (!uuid) return

      const response = await fetch("/api/edit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid,
          product_name: newProduct.product_name,
          price: Number.parseFloat(newProduct.price),
          quantity: Number.parseInt(newProduct.quantity),
        }),
      })

      const data = await response.json()
      if (data.status === "success") {
        toast.success("Product added successfully", {
          description: "Success",
        })
        fetchStocks()
        setIsAddingProduct(false)
        setNewProduct({ product_name: "", price: "", quantity: "" })
      }
    } catch (error) {
      toast.error("Failed to add product", {
        description: "Error",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-2">Manage your product inventory and stock levels</p>
        </div>
        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>Add a new product to your inventory</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={newProduct.product_name}
                  onChange={(e) => setNewProduct({ ...newProduct, product_name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Enter price"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={newProduct.quantity}
                  onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  placeholder="Enter quantity"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct}>Add Product</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Product Inventory</span>
          </CardTitle>
          <CardDescription>
            View and edit your product inventory. Click the edit button to modify product details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stocks.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-4">Get started by adding your first product to the inventory.</p>
              <Button onClick={() => setIsAddingProduct(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stocks.map((stock) => (
                  <TableRow key={stock.uuid}>
                    <TableCell>
                      {editingId === stock.uuid ? (
                        <Input
                          value={editData.product_name || ""}
                          onChange={(e) => setEditData({ ...editData, product_name: e.target.value })}
                          className="w-full"
                        />
                      ) : (
                        <span className="font-medium">{stock.product_name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === stock.uuid ? (
                        <Input
                          type="number"
                          step="0.01"
                          value={editData.price || ""}
                          onChange={(e) => setEditData({ ...editData, price: Number.parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      ) : (
                        <span>${stock.price.toFixed(2)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === stock.uuid ? (
                        <Input
                          type="number"
                          value={editData.quantity || ""}
                          onChange={(e) => setEditData({ ...editData, quantity: Number.parseInt(e.target.value) })}
                          className="w-full"
                        />
                      ) : (
                        <span>{stock.quantity}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={stock.quantity > 10 ? "default" : stock.quantity > 0 ? "secondary" : "destructive"}
                      >
                        {stock.quantity > 10 ? "In Stock" : stock.quantity > 0 ? "Low Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {editingId === stock.uuid ? (
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSave}>
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => handleEdit(stock)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
