export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  image?: string;
    status?: 'active' | 'inactive';
  variants?: ProductVariant[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}


export interface ProductVariant {
  id: string;
  productId: string;
  size: string;
  color: string;
  design?: string;
}

export interface Batch {
  id: string;
  productId: string;
  productName: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  remaining: number;
  supplier: string;
  date: string;
  profit: number;
}

export interface BillItem {
  id: string;
  productId: string;
  productName: string;
  batchId: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  tax: number;
  roundOff: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'upi' | 'credit';
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  contact: string;
  totalSales: number;
  due: number;
  advance: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface DashboardStats {
  billsToday: number;
  totalSales: number;
  activeBatches: number;
  profitMargin: number;
}
