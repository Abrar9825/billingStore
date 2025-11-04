import { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function CategoryManagement() {
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; description?: string } | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });

  // Handle adding new category
  const handleAddCategory = () => {
    if (!categoryForm.name.trim()) return;
    addCategory({ name: categoryForm.name.trim(), description: categoryForm.description.trim() });
    setCategoryForm({ name: '', description: '' });
    setIsAddModalOpen(false);
  };

  // Handle editing category
  const handleEditCategory = () => {
    if (!selectedCategory || !categoryForm.name.trim()) return;
    updateCategory(selectedCategory.id, { name: categoryForm.name.trim(), description: categoryForm.description.trim() });
    setSelectedCategory(null);
    setCategoryForm({ name: '', description: '' });
    setIsEditModalOpen(false);
  };

  const openEditModal = (category: typeof selectedCategory) => {
    setSelectedCategory(category);
    setCategoryForm({ name: category!.name, description: category!.description || '' });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-4 fade-in px-2 sm:px-4 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h1 className="text-xl font-bold text-gray-900">Category Management</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xs sm:max-w-md w-full">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category Name</label>
                <Input placeholder="Enter category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Optional description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
              </div>
              <Button onClick={handleAddCategory} className="w-full">Add Category</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="glass border-white/20 hover-lift">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <Table className="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id} className="hover:bg-white/50">
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(category)}><Edit3 className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => deleteCategory(category.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {/* Mobile Cards */}
          <div className="sm:hidden flex flex-col gap-2">
            {categories.map((category) => (
              <div key={category.id} className="rounded-lg border bg-white/80 p-3 flex flex-col gap-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{category.name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="p-1" onClick={() => openEditModal(category)}><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="p-1 text-red-600 hover:text-red-700" onClick={() => deleteCategory(category.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
                <div className="text-xs text-gray-700">{category.description || '-'}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xs sm:max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category Name</label>
              <Input placeholder="Enter category name" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Optional description" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} />
            </div>
            <Button onClick={handleEditCategory} className="w-full">Update Category</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
