"use client"

import { useState, useEffect } from "react"

interface StockItem {
  uuid: string
  product_name: string
  price: number
  quantity: number
}

const showToast = (message: string, type: "success" | "error") => {
  const container = document.getElementById("toast-container")
  if (!container) return

  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.textContent = message

  container.appendChild(toast)

  setTimeout(() => {
    toast.remove()
  }, 3000)
}

export default function InventoryPage() {
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<StockItem>>({})
  const [newItem, setNewItem] = useState({ product_name: "", price: "", quantity: "" })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStocks()
  }, [])

  const fetchStocks = async () => {
    const uuid = localStorage.getItem("business_uuid")
    if (!uuid) return

    try {
      const response = await fetch("http://localhost:8000/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid }),
      })

      const data = await response.json()
      if (data.status === "success") {
        setStocks(data.stocks)
      }
    } catch (error) {
      showToast("Failed to fetch inventory", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (stock: StockItem) => {
    setEditingId(stock.uuid)
    setEditData(stock)
  }

  const handleSave = async () => {
    const uuid = localStorage.getItem("business_uuid")
    if (!uuid || !editData) return

    try {
      const response = await fetch("http://localhost:8000/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          product_name: editData.product_name,
          price: editData.price,
          quantity: editData.quantity,
        }),
      })

      const data = await response.json()
      if (data.status === "success") {
        showToast("Item updated successfully", "success")
        setEditingId(null)
        fetchStocks()
      } else {
        showToast(data.message, "error")
      }
    } catch (error) {
      showToast("Failed to update item", "error")
    }
  }

  const handleAddNew = async () => {
    const uuid = localStorage.getItem("business_uuid")
    if (!uuid) return

    try {
      const response = await fetch("http://localhost:8000/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uuid,
          product_name: newItem.product_name,
          price: Number.parseFloat(newItem.price),
          quantity: Number.parseInt(newItem.quantity),
        }),
      })

      const data = await response.json()
      if (data.status === "success") {
        showToast("Item added successfully", "success")
        setNewItem({ product_name: "", price: "", quantity: "" })
        fetchStocks()
      } else {
        showToast(data.message, "error")
      }
    } catch (error) {
      showToast("Failed to add item", "error")
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-1/3"></div>
          <div className="h-64 bg-gradient-to-r from-blue-100 to-purple-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Inventory Management
        </h1>
        <p className="text-gray-600 mt-2 text-lg">Manage your colorful stock items and quantities</p>
      </div>

      {/* Add New Item Card */}
      <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-xl">
        <div className="card-header">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Add New Item
          </h2>
          <p className="text-gray-600">Add a new product to your inventory</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              className="input"
              placeholder="Product Name"
              value={newItem.product_name}
              onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
            />
            <input
              type="number"
              className="input"
              placeholder="Price"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            />
            <input
              type="number"
              className="input"
              placeholder="Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <button onClick={handleAddNew} className="btn btn-success flex items-center justify-center gap-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-xl">
        <div className="card-header">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Current Inventory
          </h2>
          <p className="text-gray-600">View and edit your current stock items</p>
        </div>
        <div className="card-content">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th className="bg-gradient-to-r from-blue-100 to-indigo-100">Product Name</th>
                  <th className="bg-gradient-to-r from-green-100 to-emerald-100">Price</th>
                  <th className="bg-gradient-to-r from-purple-100 to-pink-100">Quantity</th>
                  <th className="bg-gradient-to-r from-orange-100 to-red-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((stock) => (
                  <tr key={stock.uuid} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50">
                    <td>
                      {editingId === stock.uuid ? (
                        <input
                          className="input"
                          value={editData.product_name || ""}
                          onChange={(e) => setEditData({ ...editData, product_name: e.target.value })}
                        />
                      ) : (
                        <span className="font-medium text-gray-800">{stock.product_name}</span>
                      )}
                    </td>
                    <td>
                      {editingId === stock.uuid ? (
                        <input
                          type="number"
                          className="input"
                          value={editData.price || ""}
                          onChange={(e) => setEditData({ ...editData, price: Number.parseFloat(e.target.value) })}
                        />
                      ) : (
                        <span className="font-bold text-green-600">${stock.price}</span>
                      )}
                    </td>
                    <td>
                      {editingId === stock.uuid ? (
                        <input
                          type="number"
                          className="input"
                          value={editData.quantity || ""}
                          onChange={(e) => setEditData({ ...editData, quantity: Number.parseInt(e.target.value) })}
                        />
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-medium">
                          {stock.quantity}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingId === stock.uuid ? (
                        <div className="flex space-x-2">
                          <button onClick={handleSave} className="btn btn-success px-3 py-1 text-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button onClick={() => setEditingId(null)} className="btn btn-secondary px-3 py-1 text-sm">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleEdit(stock)} className="btn btn-primary px-3 py-1 text-sm">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      )}
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
