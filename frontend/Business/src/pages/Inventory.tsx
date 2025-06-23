import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Edit2, Save, X, Package, Plus, ReceiptText } from 'lucide-react';
import { Dialog } from "@/components/ui/dialog";
import jsPDF from "jspdf";

interface Product {
  uuid: string;
  product_name: string;
  price: number;
  quantity: number;
}

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({
    product_name: '',
    price: '',
    quantity: '',
  });
  const [detectedItems, setDetectedItems] = useState<{ [key: string]: number }>({});
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showInvoiceUpload, setShowInvoiceUpload] = useState(false);
  const [invoiceUploading, setInvoiceUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const invoiceInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const uuid = localStorage.getItem('businessUuid');
    if (!uuid) return;

    try {
      const response = await fetch('http://localhost:8000/view/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setProducts(data.stocks || []);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch inventory",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.uuid);
    setEditData({ ...product });
  };

  const handleSave = async () => {
    if (!editData) return;

    const uuid = localStorage.getItem('businessUuid');
    try {
      const response = await fetch('http://localhost:8000/edit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: uuid,
          product_name: editData.product_name,
          price: editData.price,
          quantity: editData.quantity,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
        fetchInventory();
        setEditingId(null);
        setEditData(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    const uuid = localStorage.getItem('businessUuid');
    try {
      const response = await fetch('http://localhost:8000/edit/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: uuid,
          product_name: newProduct.product_name,
          price: parseFloat(newProduct.price),
          quantity: parseInt(newProduct.quantity),
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        toast({
          title: "Success",
          description: "Product added successfully",
        });
        fetchInventory();
        setIsAdding(false);
        setNewProduct({ product_name: '', price: '', quantity: '' });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
    setIsAdding(false);
    setNewProduct({ product_name: '', price: '', quantity: '' });
  };

  // Function to handle image upload and detection, and directly add detected items to inventory
  const handleDetectImage = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("http://localhost:4000/detect", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      const uuid = localStorage.getItem('businessUuid');
      if (uuid) {
        // Always send the detected quantity, let backend handle add/update logic
        await Promise.all(
          Object.entries(data).map(async ([product_name, quantity]) => {
            const qty = typeof quantity === "number" ? quantity : Number(quantity) || 0;
            const payload = {
              uuid,
              product_name,
              price: 0, // Default price, user can edit later
              quantity: qty,
            };
            await fetch('http://localhost:8000/edit/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
          })
        );
        // Refresh inventory after all edits are done
        await fetchInventory();
        toast({
          title: "Detection Complete",
          description: "All detected items have been added to inventory.",
        });
      }
      setShowUpload(false);
      setDetectedItems({});
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to detect items from image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  // NEW: Handle invoice image upload and remove items from inventory
  const handleInvoiceImage = async (file: File) => {
    setInvoiceUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      // 1. Send image to invoice API (returns invoice JSON)
      const response = await fetch("http://localhost:5000/detect", {
        method: "POST",
        body: formData,
      });

      const invoice = await response.json();

      if (!invoice.items || !Array.isArray(invoice.items)) {
        toast({
          title: "Error",
          description: "Could not parse invoice items.",
          variant: "destructive",
        });
        setInvoiceUploading(false);
        setShowInvoiceUpload(false);
        return;
      }

      // 2. Remove items from inventory by updating backend
      const uuid = localStorage.getItem('businessUuid');
      await Promise.all(
        invoice.items.map(async (item: any) => {
          const product = products.find(
            (p) => p.product_name.toLowerCase() === item.name.toLowerCase()
          );
          if (product) {
            const newQty = Math.max(0, product.quantity - item.quantity);
            await fetch('http://localhost:8000/edit/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                uuid,
                product_name: product.product_name,
                price: product.price,
                quantity: newQty,
              }),
            });
          }
        })
      );

      await fetchInventory();
      toast({
        title: "Invoice Processed",
        description: "Inventory updated based on invoice.",
      });

      // 3. Generate and download PDF in browser
      generateInvoicePDF(invoice);

      toast({
        title: "Invoice PDF Downloaded",
        description: "Invoice PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process invoice image.",
        variant: "destructive",
      });
    } finally {
      setInvoiceUploading(false);
      setShowInvoiceUpload(false);
    }
  };

  function generateInvoicePDF(invoice: any) {
    const doc = new jsPDF();
    let y = 15;

    // Add business name (uuid) at the top
    const businessUuid = localStorage.getItem('businessUuid') || "Business";
    doc.setFontSize(16);
    doc.text(`Business: ${businessUuid}`, 14, y);
    y += 10;

    doc.setFontSize(18);
    doc.text("Invoice", 14, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Currency: ${invoice.currency || "Rs"}`, 14, y);
    y += 10;

    // Table header
    doc.setFont("helvetica", "bold");
    doc.text("Item", 14, y);
    doc.text("Quantity", 80, y);
    doc.text("Unit Price", 120, y);
    doc.text("Total", 170, y);
    y += 8;
    doc.setFont("helvetica", "normal");

    invoice.items.forEach((item: any) => {
      doc.text(String(item.name), 14, y);
      doc.text(String(item.quantity), 80, y);
      doc.text(String(item.unit_price), 120, y);
      doc.text(String(item.total_price), 170, y);
      y += 8;
    });

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text(`Subtotal: ${invoice.subtotal}`, 14, y);
    y += 8;
    doc.text(`Total: ${invoice.total}`, 14, y);

    doc.save("invoice.pdf");
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">``
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-600 mt-2">Manage your product inventory and stock levels</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <Package className="mr-2 h-4 w-4" />
              Detect from Image
            </Button>
            <Button
              onClick={() => setShowInvoiceUpload(true)}
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
            >
              <ReceiptText className="mr-2 h-4 w-4" />
              Upload Image For Invoice
            </Button>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Invoice Upload Dialog */}
        {showInvoiceUpload && (
          <Dialog open={showInvoiceUpload} onOpenChange={setShowInvoiceUpload}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Invoice Image</h2>
              <input
                type="file"
                accept="image/*"
                ref={invoiceInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleInvoiceImage(e.target.files[0]);
                  }
                }}
                disabled={invoiceUploading}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => {
                    if (invoiceInputRef.current) invoiceInputRef.current.value = "";
                    setShowInvoiceUpload(false);
                  }}
                  variant="outline"
                  disabled={invoiceUploading}
                >
                  Cancel
                </Button>
              </div>
              {invoiceUploading && <div className="mt-2 text-blue-600">Processing invoice...</div>}
            </div>
          </Dialog>
        )}

        {/* Detect Image Upload Dialog */}
        {showUpload && (
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Upload Image for Detection</h2>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    handleDetectImage(e.target.files[0]);
                  }
                }}
                disabled={uploading}
              />
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    setShowUpload(false);
                  }}
                  variant="outline"
                  disabled={uploading}
                >
                  Cancel
                </Button>
              </div>
              {uploading && <div className="mt-2 text-blue-600">Detecting items...</div>}
            </div>
          </Dialog>
        )}

        {/* Detected Items Table */}
        {Object.keys(detectedItems).length > 0 && (
          <Card className="border-0 shadow-lg">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Detected Items</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Item Name</th>
                    <th className="text-left py-2 px-4 font-medium text-gray-700">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(detectedItems).map(([name, qty]) => (
                    <tr key={name} className="border-b border-gray-100">
                      <td className="py-2 px-4">{name}</td>
                      <td className="py-2 px-4">{qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card className="border-0 shadow-lg">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Product Inventory</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Product Name</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Price (₹)</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Total Value</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isAdding && (
                    <tr className="border-b border-gray-100 bg-blue-50">
                      <td className="py-3 px-4">
                        <Input
                          value={newProduct.product_name}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, product_name: e.target.value }))}
                          placeholder="Product name"
                          className="border-blue-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={newProduct.price}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="Price"
                          className="border-blue-200"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={newProduct.quantity}
                          onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: e.target.value }))}
                          placeholder="Quantity"
                          className="border-blue-200"
                        />
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        ₹{(parseFloat(newProduct.price || '0') * parseInt(newProduct.quantity || '0')).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAddProduct} className="bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {products.map((product) => (
                    <tr key={product.uuid} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {editingId === product.uuid ? (
                          <Input
                            value={editData?.product_name || ''}
                            onChange={(e) => setEditData(prev => prev ? { ...prev, product_name: e.target.value } : null)}
                            className="border-blue-200"
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{product.product_name}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === product.uuid ? (
                          <Input
                            type="number"
                            value={editData?.price || ''}
                            onChange={(e) => setEditData(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                            className="border-blue-200"
                          />
                        ) : (
                          <span className="text-gray-700">₹{product.price}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === product.uuid ? (
                          <Input
                            type="number"
                            value={editData?.quantity || ''}
                            onChange={(e) => setEditData(prev => prev ? { ...prev, quantity: parseInt(e.target.value) } : null)}
                            className="border-blue-200"
                          />
                        ) : (
                          <span className="text-gray-700">{product.quantity}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        ₹{(product.price * product.quantity).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === product.uuid ? (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
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

              {products.length === 0 && !isAdding && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products in inventory</p>
                  <Button
                    onClick={() => setIsAdding(true)}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    Add Your First Product
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Inventory;
