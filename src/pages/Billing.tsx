import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, Receipt, FileText, MessageCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { BillPreview } from '@/components/BillPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// === GITHUB CONFIG ===
const GITHUB_TOKEN = import.meta.env.VITE_API_TOKEN;
const GITHUB_REPO = 'Abrar9825/billingStore';
const GITHUB_BRANCH = 'main'; // Or 'master' if your repo uses that
const GITHUB_PDF_FOLDER: string = 'bills'; // Folder name in repo for PDFs

const Billing = () => {
  const { products, batches, currentBill, addProductToBill, removeFromBill, clearBill, saveBill, updateBatch, categories } = useStore();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'credit'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [previewBill, setPreviewBill] = useState<ReturnType<typeof getCurrentBillData> | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadingRef = React.useRef(false);

  // Filter products by category only
  const filteredProducts = React.useMemo(() => 
    products.filter(product => {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      return matchesCategory;
    }), [products, selectedCategory]
  );

  const availableBatches = React.useMemo(() => 
    batches.filter(batch => 
      batch.productId === selectedProduct && batch.remaining > 0
    ), [batches, selectedProduct]
  );

  const selectedBatchData = batches.find(batch => batch.id === selectedBatch);

  // Auto-select batch if only one available
  React.useEffect(() => {
    if (!selectedProduct) return;
    
    if (availableBatches.length === 1 && selectedBatch !== availableBatches[0].id) {
      setSelectedBatch(availableBatches[0].id);
    } else if (availableBatches.length === 0 && selectedBatch !== '') {
      setSelectedBatch('');
    }
  }, [selectedProduct, availableBatches.length, selectedBatch]);

  const handleAddToBill = () => {
    const effectiveBatch = availableBatches.length === 1 ? availableBatches[0].id : selectedBatch;
    
    if (!selectedProduct || !effectiveBatch || !quantity) return;
    
    const product = products.find(p => p.id === selectedProduct);
    const batch = batches.find(b => b.id === effectiveBatch);
    
    if (product && batch && parseFloat(quantity) <= batch.remaining) {
      addProductToBill(selectedProduct, effectiveBatch, parseFloat(quantity), batch.salePrice);
      setQuantity('');
      setSelectedProduct('');
      setSelectedBatch('');
    }
  };

  const subtotal = currentBill.reduce((sum, item) => sum + item.amount, 0);

// discount in %
const discountAmount = (subtotal * discount) / 100;

// discounted subtotal
const discountedSubtotal = subtotal - discountAmount;

// GST (18%) on discounted amount
const tax = discountedSubtotal * 0.18;

// final total
const total = discountedSubtotal + tax;



  const getCurrentBillData = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    return {
      billNumber: `BILL-${Date.now()}`,
      date: formattedDate,
      customerName: customerName || 'Walk-in Customer',
      customerPhone: customerPhone || 'N/A',
      items: currentBill.map(item => ({
        id: item.id,
        name: item.productName,
        quantity: item.quantity,
        rate: item.rate,
        amount: item.amount
      })),
      subtotal,
      tax,
     
      discountAmount,
      total
    };
  };

  // Helper: Upload PDF to GitHub (Public Repo)
  async function uploadPdfToGitHub(pdfBlob: Blob, filename: string): Promise<string | null> {
    try {
      // Convert blob to base64 in chunks to avoid stack overflow
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert to base64 in smaller chunks to avoid "Maximum call stack size exceeded"
      let base64 = '';
      const chunkSize = 0x8000; // 32KB chunks
      for (let i = 0; i < bytes.length; i += chunkSize) {
        const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
        base64 += String.fromCharCode.apply(null, Array.from(chunk));
      }
      base64 = btoa(base64);
      
      const path = GITHUB_PDF_FOLDER ? `${GITHUB_PDF_FOLDER.replace(/\/$/, '')}/${filename}` : filename;
      const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`;
      const message = `Add bill PDF ${filename}`;
      
      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: base64,
          branch: GITHUB_BRANCH,
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('GitHub upload failed:', errorText);
        throw new Error(`GitHub upload failed: ${res.statusText}`);
      }
      
      // For public repos, return the direct raw download URL (no token needed!)
      return `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  const handleGenerateBill = async () => {
    if (currentBill.length === 0 || uploadingRef.current) return;
    
    uploadingRef.current = true;
    setUploading(true);
    
    // Decrease batch quantities
    currentBill.forEach(billItem => {
      const batch = batches.find(b => b.id === billItem.batchId);
      if (batch) {
        updateBatch(batch.id, {
          remaining: batch.remaining - billItem.quantity
        });
      }
    });
    
    // Capture current bill for preview before clearing
    const billData = getCurrentBillData();
    setPreviewBill(billData);
    saveBill(paymentMethod);
    setShowBillPreview(true);
    
    // Wait for modal to render, then generate PDF
    setTimeout(async () => {
      try {
        // Wait longer for modal to fully render
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check multiple times if element exists
        let element = null;
        let attempts = 0;
        while (!element && attempts < 15) {
          element = document.getElementById('bill-content');
          if (!element) {
            await new Promise(resolve => setTimeout(resolve, 300));
            attempts++;
          }
        }
        
        if (!element) {
          console.error('Element with id "bill-content" not found after multiple attempts');
          throw new Error('Bill content not found - modal may not be rendered yet');
        }
        
        // Extra wait to ensure all content is fully rendered
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get parent container and save original styles
        const container = element.parentElement;
        let originalOverflow = '';
        let originalMaxHeight = '';
        let originalWidth = '';
        let originalMaxWidth = '';
        
        if (container) {
          // Temporarily remove size restrictions for full capture
          originalOverflow = container.style.overflow;
          originalMaxHeight = container.style.maxHeight;
          originalWidth = container.style.width;
          originalMaxWidth = container.style.maxWidth;
          container.style.overflow = 'visible';
          container.style.maxHeight = 'none';
          container.style.width = '800px'; // Set larger width for better quality
          container.style.maxWidth = '800px';
          
          // Wait for reflow
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        // Get actual full height of content
        const fullHeight = element.scrollHeight;
        const fullWidth = element.scrollWidth;
        
        const canvas = await html2canvas(element, { 
          scale: 2.5,
          useCORS: true, 
          logging: false,
          backgroundColor: null,
          width: fullWidth,
          height: fullHeight,
          windowWidth: fullWidth,
          windowHeight: fullHeight,
          scrollY: -window.scrollY,
          scrollX: -window.scrollX,
          allowTaint: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.getElementById('bill-content');
            if (clonedElement) {
              clonedElement.style.overflow = 'visible';
              clonedElement.style.height = 'auto';
              clonedElement.style.maxHeight = 'none';
              clonedElement.style.display = 'block';
            }
          }
        });
        
        // Restore container styles
        if (container) {
          container.style.overflow = originalOverflow;
          container.style.maxHeight = originalMaxHeight;
          container.style.width = originalWidth;
          container.style.maxWidth = originalMaxWidth;
        }
        
        const imgData = canvas.toDataURL('image/png', 1.0);
        
        // Convert canvas dimensions to mm
        const canvasWidthMM = canvas.width * 0.264583;
        const canvasHeightMM = canvas.height * 0.264583;
        
        // Create PDF with custom size matching content exactly (no margins)
        const pdf = new jsPDF({
          orientation: canvasWidthMM > canvasHeightMM ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [canvasWidthMM, canvasHeightMM],
          compress: true
        });
        
        // Add image with no margins - perfect fit
        pdf.addImage(imgData, 'PNG', 0, 0, canvasWidthMM, canvasHeightMM, undefined, 'FAST');
        
        const pdfBlob = pdf.output('blob');
        const filename = `Bill_${billData.billNumber}.pdf`;
        const url = await uploadPdfToGitHub(pdfBlob, filename);
        setPdfUrl(url);
      } catch (err) {
        console.error('PDF generation error:', err);
        alert('PDF generation/upload failed: ' + (err instanceof Error ? err.message : String(err)));
        setPdfUrl(null);
      } finally {
        setUploading(false);
        uploadingRef.current = false;
      }
    }, 3000); // Increased timeout to ensure modal is fully rendered
  };

  return (
    <div className="fade-in w-full max-w-6xl mx-auto px-2 sm:px-4 py-4">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Create Bill</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Add Product + Bill Items */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Add Product */}
          <Card className="glass border-white/20 hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Add Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="category-select" className="text-xs text-gray-700">Filter by Category</Label>
                <Select value={selectedCategory || "all"} onValueChange={(value) => {
                  setSelectedCategory(value === "all" ? '' : value);
                  setSelectedProduct('');
                  setSelectedBatch('');
                }}>
                  <SelectTrigger id="category-select">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="product-select" className="text-xs text-gray-700">Select Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product-select">
                    <SelectValue placeholder="Choose a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredProducts
                      .filter(product => product.status !== 'inactive')
                      .map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({product.category})
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedProduct && availableBatches.length > 1 && (
                <div className="space-y-1">
                  <Label htmlFor="batch-select" className="text-xs text-gray-700">Select Batch</Label>
                  <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                    <SelectTrigger id="batch-select">
                      <SelectValue placeholder="Choose a batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBatches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{batch.id}</span>
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary">₹{batch.salePrice}</Badge>
                              <Badge variant="outline">{batch.remaining} left</Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {selectedProduct && availableBatches.length === 1 && (
                <div className="space-y-1">
                  <Label className="text-xs text-gray-700">Batch (Auto-selected)</Label>
                  <div className="p-2 bg-gray-50 rounded border">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{availableBatches[0].id}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">₹{availableBatches[0].salePrice}</Badge>
                        <Badge variant="outline">{availableBatches[0].remaining} left</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedProduct && availableBatches.length > 0 && (
                <div className="space-y-1">
                  <Label htmlFor="quantity-input" className="text-xs text-gray-700">Quantity</Label>
                  <Input
                    id="quantity-input"
                    type="number"
                    placeholder="Enter quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    max={selectedBatchData?.remaining || availableBatches[0]?.remaining}
                  />
                  {(selectedBatchData || availableBatches[0]) && (
                    <p className="text-xs text-gray-500">
                      Available: {(selectedBatchData || availableBatches[0]).remaining} units
                    </p>
                  )}
                </div>
              )}
              <Button 
                onClick={handleAddToBill} 
                disabled={!selectedProduct || !quantity || availableBatches.length === 0}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 py-2 text-sm mt-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add to Bill
              </Button>
            </CardContent>
          </Card>
          {/* Bill Items */}
          <Card className="glass border-white/20 hover-lift">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bill Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {currentBill.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No items added yet</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentBill.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-white/70 p-3 flex flex-col gap-1 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{item.productName}</span>
                        <Badge variant="outline">{item.batchId}</Badge>
                      </div>
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Qty: {item.quantity}</span>
                        <span>Rate: ₹{item.rate}</span>
                        <span>Amt: ₹{item.amount}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromBill(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 self-end mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right: Bill Summary */}
        <div className="w-full lg:w-[340px] flex-shrink-0">
          <Card className="flex flex-col h-full glass border-white/20 hover-lift sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-2">
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="text-sm"
                />
                <Input
                  id="customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="text-sm"
                />
                <Input
                  id="discount"
                  type="number"
                  value={discount === 0 ? '' : discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="Discount (%)"
                  className="text-sm"
                />
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-gray-700">Payment Method</span>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setPaymentMethod('cash')}
                      variant={paymentMethod === 'cash' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      Cash
                    </Button>
                    <Button
                      onClick={() => setPaymentMethod('upi')}
                      variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      UPI
                    </Button>
                    <Button
                      onClick={() => setPaymentMethod('credit')}
                      variant={paymentMethod === 'credit' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      Credit
                    </Button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Discount</span>
                  <span className="font-semibold text-gray-900">-₹{discountAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Tax (18%)</span>
                  <span className="font-semibold text-gray-900">+₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-300 pt-2 mt-2 font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={handleGenerateBill}
                disabled={currentBill.length === 0 || uploading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 py-2 text-sm"
              >
                {uploading ? 'Uploading...' : 'Generate Bill'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Bill Preview Modal */}
      {showBillPreview && previewBill && (
        <BillPreview
          isOpen={showBillPreview}
          billData={previewBill}
          onClose={() => setShowBillPreview(false)}
          pdfUrl={pdfUrl}
        />
      )}
    </div>
  );
};

export default Billing;