import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Printer, X, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface BillPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  billData: {
    billNumber: string;
    date: string;
    customerName: string;
    customerPhone: string;
    items: BillItem[];
    subtotal: number;
    tax: number;
    discountAmount: number;
    total: number;
  };
  pdfUrl?: string;
}

export const BillPreview: React.FC<BillPreviewProps> = ({ isOpen, onClose, billData, pdfUrl }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('bill-content');
    if (!element) return;

    try {
      // Generate PDF from bill content with high quality
      const canvas = await html2canvas(element, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('bill-content');
          if (clonedElement) {
            // Ensure all styles are properly rendered
            clonedElement.style.transform = 'scale(1)';
            clonedElement.style.transformOrigin = 'top left';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png', 1.0); // Max quality
      
      // Use A4 size for better quality
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calculate dimensions to fit on A4 (210mm x 297mm)
      const pageWidth = 210;
      const pageHeight = 297;
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / (imgWidth * 0.264583), pageHeight / (imgHeight * 0.264583));
      
      const scaledWidth = imgWidth * 0.264583 * ratio;
      const scaledHeight = imgHeight * 0.264583 * ratio;
      const x = (pageWidth - scaledWidth) / 2;
      const y = 10; // 10mm from top
      
      // Add the image centered on page
      pdf.addImage(imgData, 'PNG', x, y, scaledWidth, scaledHeight, undefined, 'FAST');
      
      // Download PDF
      pdf.save(`Bill_${billData.billNumber}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleShareWhatsApp = () => {
    if (!pdfUrl) {
      alert('PDF is still uploading. Please wait a moment and try again.');
      return;
    }
    const phone = billData.customerPhone.replace(/\D/g, '');
    const message = `🧾 *CAPITAL - Invoice*\n\n*Bill No:* ${billData.billNumber}\n*Date:* ${billData.date}\n*Customer:* ${billData.customerName}\n*Total:* ₹${billData.total.toFixed(2)}\n\n📄 Download your bill PDF:\n${pdfUrl}\n\nThank you for your business! 🙏`;
    const whatsappUrl = phone && phone !== 'N/A'
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg w-full h-full sm:h-auto sm:max-w-2xl md:max-w-3xl lg:max-w-4xl sm:max-h-[90vh] overflow-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 sm:p-4 border-b print:hidden gap-2 sticky top-0 bg-white z-10">
          <h2 className="text-base sm:text-xl font-semibold">Bill Preview</h2>
          <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            <Button onClick={handleShareWhatsApp} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
              <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Share </span>WhatsApp
            </Button>
            <Button onClick={handleDownloadPDF} className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Download </span>PDF
            </Button>
            <Button onClick={handlePrint} variant="outline" className="flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
              <Printer className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Print</span>
            </Button>
            <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2">
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-1 sm:p-4 print:p-0" id="bill-content">
          <div className="bg-white border border-black text-[10px] sm:text-xs md:text-sm">
            {/* Header - Dark Gray/Black Background */}
            <div className="bg-[#3d3d3d] text-white">
              {/* Top Section with Logo and Contact */}
              <div className="flex items-start justify-between px-2 sm:px-6 pt-2 sm:pt-3 pb-1 sm:pb-2">
                <div className="flex-1"></div>
                <div className="flex-1 flex justify-center items-start">
                  {/* Empty space - logo will be added here if needed */}
                </div>
                <div className="flex-1 text-right text-[9px] sm:text-xs flex flex-col items-end gap-1">
                  <p className="font-semibold">Hamza : 9978078241</p>
                  <div className="bg-white p-1 sm:p-2 rounded">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 flex items-center justify-center text-[6px] sm:text-[8px] text-black">
                      <p>QR Code<br/>@CAPITAL.ANIS</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Title with small red dot above i */}
              <div className="text-center py-2 sm:py-3 relative">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-[0.15em] sm:tracking-[0.3em] mb-1 sm:mb-2 relative inline-block">
                  CAP
                  <span className="relative inline-block">
                    <span className="absolute -top-1 sm:-top-3 left-1 sm:left-2 transform -translate-x-1/2 w-1.5 h-1.5 sm:w-3 sm:h-3 bg-red-600 rounded-full"></span>
                    I
                  </span>
                  TAL
                </h1>
                <p className="text-[10px] sm:text-sm tracking-wide">(DHALGARWADWALA)</p>
                <p className="text-[8px] sm:text-xs mt-1 px-2">Exclusive Ready to Wear Available in XL to 8XL SIZES</p>
              </div>

              {/* Address Bar */}
              <div className="bg-[#2d2d2d] text-center py-1 sm:py-2 px-1 sm:px-4 text-[8px] sm:text-xs border-t border-white/20">
                <p className="leading-tight">S/101, Above Huseni Bakery, Opp. Nayara Petrol Pump, Juhapura, Ahmedabad.</p>
              </div>
            </div>


            {/* Bill Info and Date */}
            <div className="flex justify-between items-center p-2 sm:p-4 border-b border-gray-300">
              <div></div>
              <div className="text-right">
                <p className="text-[10px] sm:text-sm">
                  <span className="text-red-600 font-semibold mr-1 sm:mr-2">Date :</span>
                  <span className="text-sm sm:text-lg font-handwriting">{billData.date}</span>
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div className="p-1 sm:p-3">
              <table className="w-full border-collapse border border-black">
                <thead>
                  <tr className="bg-[#4a4838] text-white">
                    <th className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-center text-[9px] sm:text-xs font-bold">Particulars</th>
                    <th className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-center text-[9px] sm:text-xs font-bold">Qty</th>
                    <th className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-center text-[9px] sm:text-xs font-bold">Rate</th>
                    <th className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-center text-[9px] sm:text-xs font-bold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {billData.items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-[9px] sm:text-xs">{item.name}</td>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-center text-[9px] sm:text-xs">{item.quantity}</td>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-center text-[9px] sm:text-xs">{item.rate.toFixed(2)}</td>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-2 text-right text-[9px] sm:text-xs">{item.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Empty rows for spacing - fewer on mobile */}
                  {[...Array(Math.max(0, (window.innerWidth < 640 ? 3 : 8) - billData.items.length))].map((_, i) => (
                    <tr key={`empty-${i}`}>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-3 text-[9px] sm:text-xs">&nbsp;</td>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-3 text-[9px] sm:text-xs">&nbsp;</td>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-3 text-[9px] sm:text-xs">&nbsp;</td>
                      <td className="border border-black px-1 sm:px-2 py-1 sm:py-3 text-[9px] sm:text-xs">&nbsp;</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary (Discount, Tax, Total) */}
            <div className="p-2 sm:p-3">
              <div className="border-t border-black pt-2">
                <div className="flex flex-col items-end gap-0.5 sm:gap-1">
                  <div className="flex justify-between w-full text-[9px] sm:text-xs">
                    <span className="font-semibold">Subtotal</span>
                    <span>₹{(billData.subtotal).toFixed(2)}</span>
                  </div>
                  {billData.discountAmount > 0 && (
                    <div className="flex justify-between w-full text-[9px] sm:text-xs text-green-700">
                      <span className="font-semibold">Discount</span>
                      <span>-₹{billData.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {/* Tax split: 9% CGST + 9% SGST = 18% GST */}
                  <div className="flex justify-between w-full text-[9px] sm:text-xs">
                    <span className="font-semibold">CGST (9%)</span>
                    <span>₹{(billData.tax/2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full text-[9px] sm:text-xs">
                    <span className="font-semibold">SGST (9%)</span>
                    <span>₹{(billData.tax/2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-full text-[10px] sm:text-xs font-bold border-t border-dashed border-gray-400 pt-1 mt-1">
                    <span>Grand Total</span>
                    <span className="text-sm sm:text-lg text-green-700 font-bold">₹{billData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-[#8b0000] bg-white p-2 sm:p-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[8px] sm:text-[10px]">
                <div>
                  <p className="font-bold mb-0.5 sm:mb-1">● Once the goods is sold it won't be returned.</p>
                  <p className="font-bold mb-0.5 sm:mb-1">● You can change the product within 4 days from the bill date.</p>
                  <p className="font-bold mb-0.5 sm:mb-1">● No Discount ● No Return ● Friday 12:30 to 1:45 Closed</p>
                </div>
                <div className="text-right">
                  <p className="font-bold mb-4 sm:mb-8">From: CAPITAL</p>
                  <div className="border-t border-black pt-1 mt-2 sm:mt-4">
                    <p className="text-[9px] sm:text-xs">Signature</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #bill-content, #bill-content * {
            visibility: visible;
          }
          #bill-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};