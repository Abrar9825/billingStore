import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2, Receipt, FileText, Search, MessageCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { BillPreview } from '@/components/BillPreview';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// === GITHUB CONFIG ===
const GITHUB_TOKEN = 'REDACTED_TOKEN';
const GITHUB_REPO = 'Abrar9825/billingStore';
const GITHUB_BRANCH = 'main'; // Or 'master' if your repo uses that
const GITHUB_PDF_FOLDER: string = 'bills'; // Folder name in repo for PDFs

const Billing = () => {
  const { products, batches, currentBill, addProductToBill, removeFromBill, clearBill, saveBill, updateBatch } = useStore();
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'credit'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState(0);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [previewBill, setPreviewBill] = useState<ReturnType<typeof getCurrentBillData> | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const uploadingRef = React.useRef(false);

  // Filter products and batches based on search
  const filteredProducts = React.useMemo(() => 
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]
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


  const generateDemoBill = () => {
    setShowBillPreview(true);
  };

  const getCurrentBillData = () => {
    return {
      billNumber: `BILL-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
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
        const element = document.getElementById('bill-content');
        if (!element) {
          throw new Error('Bill content not found');
        }
        
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true, 
          logging: false,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF with custom size matching the bill content (1 page only)
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Create PDF with custom dimensions (in pixels converted to mm)
        const pdfWidth = (imgWidth * 25.4) / 96; // Convert pixels to mm (assuming 96 DPI)
        const pdfHeight = (imgHeight * 25.4) / 96;
        
        const pdf = new jsPDF({
          orientation: pdfWidth > pdfHeight ? 'l' : 'p',
          unit: 'mm',
          format: [pdfWidth, pdfHeight]
        });
        
        // Add the full image to fit exactly on one page
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
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
    }, 1500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="bg-white rounded-xl shadow-md p-4 md:p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-xl font-bold text-gray-800">Create Bill</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearBill} disabled={currentBill.length === 0}>
              Clear All
            </Button>
            <Button onClick={generateDemoBill} className="flex items-center gap-2" variant="outline">
              <FileText className="h-4 w-4" />
              Demo Bill
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Product & Batch Selection */}
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {filteredProducts.filter(product => product.status !== 'inactive').map((product) => (
                  <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedProduct && availableBatches.length > 1 && (
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {availableBatches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      Batch {batch.id} - ₹{batch.salePrice} ({batch.remaining} left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {selectedProduct && availableBatches.length === 1 && (
              <div className="text-xs text-gray-600 px-2 py-1 bg-gray-50 rounded border">
                Batch {availableBatches[0].id} - ₹{availableBatches[0].salePrice} ({availableBatches[0].remaining} left)
              </div>
            )}
            {selectedProduct && availableBatches.length > 0 && (
              <Input
                type="number"
                placeholder="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                max={selectedBatchData?.remaining || availableBatches[0]?.remaining}
                className="text-sm"
              />
            )}
            <Button
              onClick={handleAddToBill}
              disabled={!selectedProduct || !quantity || availableBatches.length === 0}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
          {/* Bill Items Table */}
          <div className="col-span-1 md:col-span-2 bg-gray-50 rounded-lg p-3 overflow-x-auto">
            <div className="text-sm font-semibold mb-2">Bill Items</div>
            {currentBill.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No items added</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentBill.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.batchId}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.rate}</TableCell>
                      <TableCell>₹{item.amount}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromBill(item.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        {/* Bill Summary */}
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between">
          <div className="flex flex-col gap-2 w-full md:w-1/3">
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="text-sm"
            />
            <Input
              id="customer-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone Number"
              className="text-sm"
            />
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              placeholder="Discount (%)"
              className="text-sm"
            />
            <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi' | 'credit') => setPaymentMethod(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 bg-gray-50 rounded-lg p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (18%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Grand Total</span>
                <span className="text-green-700">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={handleGenerateBill}
              disabled={currentBill.length === 0 || uploading}
              className="w-full mt-4"
            >
              <Receipt className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Generate Bill'}
            </Button>
          </div>
        </div>
      </div>
      {/* Bill Preview Modal */}
      <BillPreview
        isOpen={showBillPreview}
        onClose={() => setShowBillPreview(false)}
        billData={previewBill}
        pdfUrl={pdfUrl || undefined}
      />
    </div>
  );
};

export default Billing;