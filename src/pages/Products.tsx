import { useState } from 'react';
import { Plus, Edit3, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/lib/store';

export default function Products() {
  const { products, batches, addProduct, updateProduct, toggleProductStatus } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    sku: ''
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // Filter products
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get product stats
  const getProductStats = (productId: string) => {
    const productBatches = batches.filter(batch => batch.productId === productId);
    const totalBatches = productBatches.length;
    const totalRemaining = productBatches.reduce((sum, batch) => sum + batch.remaining, 0);
    return { totalBatches, totalRemaining };
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || !newProduct.sku) return;

    addProduct({
      name: newProduct.name,
      category: newProduct.category,
      sku: newProduct.sku
    });

    setNewProduct({ name: '', category: '', sku: '' });
    setIsAddModalOpen(false);
  };

  const categories = ['Clothing', 'Ethnic', 'Traditional', 'Accessories', 'Footwear'];


    const handleEditProduct = () => {
      if (!editProduct || !editProduct.name || !editProduct.category || !editProduct.sku) return;
      updateProduct(editProduct.id, {
        name: editProduct.name,
        category: editProduct.category,
        sku: editProduct.sku
      });
      setEditProduct(null);
      setIsEditModalOpen(false);
    };
  return (
    <div className="space-y-4 sm:space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Product Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  placeholder="Enter product name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">SKU</label>
                <Input
                  placeholder="Enter SKU (e.g., ABC001)"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleAddProduct} className="w-full">
                Add Product
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass border-white/20">
        <CardContent className="p-3 sm:p-4">
          <Input
            placeholder="Search products, SKU, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm sm:text-base"
          />
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredProducts.map((product) => {
          const stats = getProductStats(product.id);
          return (
            <Card key={product.id} className={`glass border-white/20 hover-lift group ${product.status === 'inactive' ? 'opacity-50' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base lg:text-lg truncate">{product.name}</CardTitle>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">{product.category}</Badge>
                        <Badge variant="outline" className="text-xs whitespace-nowrap">{product.sku}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"
                      onClick={() => {
                        setEditProduct(product);
                        setIsEditModalOpen(true);
                      }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Batches:</span>
                    <span className="font-medium">{stats.totalBatches}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Remaining Qty:</span>
                    <span className={`font-medium ${stats.totalRemaining <= 10 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.totalRemaining}
                    </span>
                  </div>

                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant={product.status === 'inactive' ? 'outline' : 'destructive'}
                      onClick={() => toggleProductStatus(product.id)}
                      className={`text-xs px-2 w-full ${product.status === 'inactive' ? 'text-white bg-green-600 border-green-600' : 'text-white bg-red-600 border-red-600'}`}
                    >
                      {product.status === 'inactive' ? 'Active' : 'Deactive'}
                    </Button>
                  </div>
                </div>
              </CardContent>

            </Card>
          );
        })}
      </div>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {editProduct && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  placeholder="Enter product name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU</label>
                <Input
                  placeholder="Enter SKU (e.g., ABC001)"
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={editProduct.category} onValueChange={(value) => setEditProduct({ ...editProduct, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleEditProduct} className="w-full">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* No products */}
      {filteredProducts.length === 0 && (
        <Card className="glass border-white/20">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first product'}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
