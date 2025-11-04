import { Product, Batch, DashboardStats, Bill, Category } from '../lib/types';

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Co-ord sets', description: 'All types of ready-made Co-ord sets' },
  { id: 'c2', name: 'Pakistani Suits', description: 'Pakistani Suits wear like kurtas, sarees' },
  { id: 'c3', name: 'Unstitched suits', description: 'Unstitched suits outfits and sets' },
  { id: 'c4', name: 'Kurtis', description: 'All types of Kurtis' },
];

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Denim Co-Ord',
    category: 'Co-ord sets',
    sku: 'DC001',
    variants: [
      { id: 'v1', productId: 'p1', size: 'M', color: 'Blue', design: 'Classic' },
      { id: 'v2', productId: 'p1', size: 'L', color: 'Black', design: 'Modern' }
    ]
  },
  {
    id: 'p2',
    name: 'Cotton Pak suit',
    category: 'Pakistani Suits',
    sku: 'CK002',
    variants: [
      { id: 'v3', productId: 'p2', size: 'S', color: 'White', design: 'Unstitched suits' },
      { id: 'v4', productId: 'p2', size: 'XL', color: 'Cream', design: 'Embroidered' }
    ]
  },
  {
    id: 'p3',
    name: 'ABC cotton suit',
    category: 'Unstitched suits',
    sku: 'SS003',
    variants: [
      { id: 'v5', productId: 'p3', size: 'Free Size', color: 'Red', design: 'Banarasi' }
    ]
  },
  {
    id: 'p4',
    name: 'ABC Linen Dress',
    category: 'Unstitched suits',
    sku: 'DL004'
  },
  {
    id: 'p5',
    name: 'riyon Co-Ord Set',
    category: 'Co-ord sets',
    sku: 'CT005'
  }
];

export const mockBatches: Batch[] = [
  {
    id: 'B101',
    productId: 'p1',
    productName: 'Denim Co-Ord',
    purchasePrice: 800,
    salePrice: 1200,
    quantity: 50,
    remaining: 45,
    supplier: 'Fashion Hub',
    date: '2024-01-15',
    profit: 400
  },
  {
    id: 'B102',
    productId: 'p2',
    productName: 'Cotton Pak suit',
    purchasePrice: 300,
    salePrice: 600,
    quantity: 30,
    remaining: 5,
    supplier: 'Textile World',
    date: '2024-01-20',
    profit: 300
  },
  {
    id: 'B205',
    productId: 'p3',
    productName: 'ABC cotton suit',
    purchasePrice: 2000,
    salePrice: 3500,
    quantity: 20,
    remaining: 18,
    supplier: 'Silk Emporium',
    date: '2024-01-25',
    profit: 1500
  }
];

// customers and expenses removed from mock data

export const mockBills: Bill[] = [
  {
    id: 'bill1',
    billNumber: 'INV-001',
    items: [
      { id: 'item1', productId: 'p1', productName: 'Denim Co-Ord', batchId: 'B101', quantity: 2, rate: 1200, amount: 2400 }
    ],
    subtotal: 2400,
    discount: 0,
    tax: 432,
    roundOff: 0,
    grandTotal: 2832,
    paymentMethod: 'upi',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    date: '2024-01-28'
  },
  {
    id: 'bill2',
    billNumber: 'INV-002',
    items: [
      { id: 'item2', productId: 'p2', productName: 'Cotton Pak suit', batchId: 'B102', quantity: 1, rate: 600, amount: 600 }
    ],
    subtotal: 600,
    discount: 0,
    tax: 108,
    roundOff: 0,
    grandTotal: 708,
    paymentMethod: 'cash',
    customerName: 'Rahul Gupta',
    customerPhone: '+91 87654 32109',
    date: '2024-01-29'
  },
  {
    id: 'bill3',
    billNumber: 'INV-003',
    items: [
      { id: 'item3', productId: 'p3', productName: 'ABC cotton suit', batchId: 'B205', quantity: 1, rate: 3500, amount: 3500 }
    ],
    subtotal: 3500,
    discount: 0,
    tax: 630,
    roundOff: 0,
    grandTotal: 4130,
    paymentMethod: 'credit',
    customerName: 'Anjali Patel',
    customerPhone: '+91 76543 21098',
    date: '2024-01-30'
  }
];

export const mockDashboardStats: DashboardStats = {
  billsToday: 12,
  totalSales: 45600,
  activeBatches: 15,
  profitMargin: 35.2
};
