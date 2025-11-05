import { useState } from 'react';
import { Plus, Edit3, Trash2, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';

export default function Batches() {
  const { batches, products, addBatch, updateBatch, deleteBatch } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  // New batch form state
  const [newBatch, setNewBatch] = useState({
    productId: '',
    purchasePrice: '',
    salePrice: '',
    quantity: '',
    supplier: ''
  });

  // Edit batch modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editBatch, setEditBatch] = useState(null);

  // Delete batch modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteBatchId, setDeleteBatchId] = useState(null);

  // Filter batches
  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProduct = filterProduct === 'all' || batch.productId === filterProduct;
    return matchesSearch && matchesProduct;
  });

  const getStockStatus = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return { status: 'safe', color: 'bg-green-500' };
    if (percentage > 20) return { status: 'medium', color: 'bg-yellow-500' };
    return { status: 'danger', color: 'bg-red-500' };
  };

  const handleAddBatch = () => {
    if (!newBatch.productId || !newBatch.purchasePrice || !newBatch.salePrice || !newBatch.quantity || !newBatch.supplier) {
      return;
    }

    const product = products.find(p => p.id === newBatch.productId);
    if (!product) return;

    const quantity = parseInt(newBatch.quantity);
    const purchasePrice = parseFloat(newBatch.purchasePrice);
    const salePrice = parseFloat(newBatch.salePrice);

    addBatch({
      productId: newBatch.productId,
      productName: product.name,
      purchasePrice,
      salePrice,
      quantity,
      remaining: quantity,
      supplier: newBatch.supplier,
      date: new Date().toISOString().split('T')[0],
      profit: salePrice - purchasePrice
    });

    setNewBatch({
      productId: '',
      purchasePrice: '',
      salePrice: '',
      quantity: '',
      supplier: ''
    });
    setIsAddModalOpen(false);
  };

  const handleEditBatch = () => {
    if (!editBatch) return;
    updateBatch(editBatch.id, {
      productId: editBatch.productId,
      productName: products.find(p => p.id === editBatch.productId)?.name || '',
      purchasePrice: parseFloat(editBatch.purchasePrice),
      salePrice: parseFloat(editBatch.salePrice),
      quantity: parseInt(editBatch.quantity),
      supplier: editBatch.supplier
    });
    setIsEditModalOpen(false);
    setEditBatch(null);
  };

  const handleDeleteBatch = () => {
    if (!deleteBatchId) return;
    deleteBatch(deleteBatchId);
    setIsDeleteModalOpen(false);
    setDeleteBatchId(null);
  };

  return (
    <div className="space-y-4 fade-in px-2 sm:px-4 max-w-7xl mx-auto">
      {/* Header and Add Batch */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">Batch Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Batch
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-full sm:max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">Add New Batch</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Product</label>
                <Select value={newBatch.productId} onValueChange={(value) => setNewBatch({...newBatch, productId: value})}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} className="text-sm">{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Purchase Price</label>
                  <Input type="number" placeholder="₹0" value={newBatch.purchasePrice} onChange={(e) => setNewBatch({...newBatch, purchasePrice: e.target.value})} className="text-sm" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Sale Price</label>
                  <Input type="number" placeholder="₹0" value={newBatch.salePrice} onChange={(e) => setNewBatch({...newBatch, salePrice: e.target.value})} className="text-sm" />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Quantity</label>
                <Input type="number" placeholder="0" value={newBatch.quantity} onChange={(e) => setNewBatch({...newBatch, quantity: e.target.value})} className="text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Supplier</label>
                <Input placeholder="Supplier name" value={newBatch.supplier} onChange={(e) => setNewBatch({...newBatch, supplier: e.target.value})} className="text-sm" />
              </div>
              <Button onClick={handleAddBatch} className="w-full text-sm">Add Batch</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Filters */}
      <Card className="glass border-white/20">
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Input
              placeholder="Search batches, products, or suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
            <Select value={filterProduct} onValueChange={setFilterProduct}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Batches Table */}
      <Card className="glass border-white/20 hover-lift">
        <CardHeader>
          <CardTitle>Batches Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>Batch</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Sale</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Remain</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const stockStatus = getStockStatus(batch.remaining, batch.quantity);
                  return (
                    <TableRow key={batch.id} className="hover:bg-white/50">
                      <TableCell className="font-medium"><Badge variant="outline">{batch.id}</Badge></TableCell>
                      <TableCell>{batch.productName}</TableCell>
                      <TableCell>₹{batch.salePrice}</TableCell>
                      <TableCell>{batch.quantity}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <div className={`h-2 w-2 rounded-full ${stockStatus.color}`} />
                          <span className={stockStatus.status === 'danger' ? 'text-red-600 font-medium' : ''}>{batch.remaining}</span>
                        </div>
                      </TableCell>
                      <TableCell className={`font-medium ${batch.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>₹{batch.profit}</TableCell>
                      <TableCell>{batch.supplier}</TableCell>
                      <TableCell>{new Date(batch.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="icon" className="p-1" onClick={() => { setEditBatch({ ...batch, purchasePrice: batch.purchasePrice.toString(), salePrice: batch.salePrice.toString(), quantity: batch.quantity.toString() }); setIsEditModalOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:text-red-700" onClick={() => { setDeleteBatchId(batch.id); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Cards */}
          <div className="md:hidden flex flex-col gap-2">
            {filteredBatches.map((batch) => {
              const stockStatus = getStockStatus(batch.remaining, batch.quantity);
              return (
                <div key={batch.id} className="rounded-lg border bg-white/80 p-3 flex flex-col gap-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{batch.productName}</span>
                    <Badge variant="outline">{batch.id}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-700">
                    <span>Sale: <span className="font-semibold">₹{batch.salePrice}</span></span>
                    <span>Qty: <span className="font-semibold">{batch.quantity}</span></span>
                    <span>Remain: <span className={`font-semibold ${stockStatus.status === 'danger' ? 'text-red-600' : ''}`}>{batch.remaining}</span></span>
                    <span>Profit: <span className={`font-semibold ${batch.profit < 0 ? 'text-red-600' : 'text-green-600'}`}>₹{batch.profit}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span>Supplier: {batch.supplier}</span>
                    <span>Date: {new Date(batch.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Button variant="ghost" size="icon" className="p-1" onClick={() => { setEditBatch({ ...batch, purchasePrice: batch.purchasePrice.toString(), salePrice: batch.salePrice.toString(), quantity: batch.quantity.toString() }); setIsEditModalOpen(true); }}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:text-red-700" onClick={() => { setDeleteBatchId(batch.id); setIsDeleteModalOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      {/* Edit Batch Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-full sm:max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Batch</DialogTitle>
          </DialogHeader>
          {editBatch && (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Product</label>
                <Select value={editBatch.productId} onValueChange={(value) => setEditBatch({ ...editBatch, productId: value })}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id} className="text-sm">{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Purchase Price</label>
                  <Input type="number" placeholder="₹0" value={editBatch.purchasePrice} onChange={(e) => setEditBatch({ ...editBatch, purchasePrice: e.target.value })} className="text-sm" />
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Sale Price</label>
                  <Input type="number" placeholder="₹0" value={editBatch.salePrice} onChange={(e) => setEditBatch({ ...editBatch, salePrice: e.target.value })} className="text-sm" />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Quantity</label>
                <Input type="number" placeholder="0" value={editBatch.quantity} onChange={(e) => setEditBatch({ ...editBatch, quantity: e.target.value })} className="text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Supplier</label>
                <Input placeholder="Supplier name" value={editBatch.supplier} onChange={(e) => setEditBatch({ ...editBatch, supplier: e.target.value })} className="text-sm" />
              </div>
              <Button onClick={handleEditBatch} className="w-full text-sm">Save Changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Batch Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-full sm:max-w-xs w-[90vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Delete Batch</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <p className="text-sm">Are you sure you want to delete this batch?</p>
            <Button onClick={handleDeleteBatch} className="w-full text-sm" variant="destructive">Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}