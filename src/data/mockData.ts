import { Product, Batch, DashboardStats, Bill, Category } from '../lib/types';

// ============= CATEGORIES =============
export const mockCategories: Category[] = [
  { id: 'c1', name: "Men's Wear", description: 'Traditional and modern menswear collection' },
  { id: 'c2', name: "Ladies' Wear", description: 'Elegant ladies ethnic and designer wear' },
  { id: 'c3', name: "Kids' Wear", description: 'Comfortable and stylish clothing for children' },
];

// ============= PRODUCTS =============
export const mockProducts: Product[] = [
  // Men's Wear Products
  {
    id: 'p1',
    name: 'White Cotton Kurta Pajama',
    category: "Men's Wear",
    sku: 'MW-001',
    status: 'active',
    variants: [
      { id: 'v1', productId: 'p1', size: 'M', color: 'White', design: 'Plain' },
      { id: 'v2', productId: 'p1', size: 'L', color: 'White', design: 'Plain' },
      { id: 'v3', productId: 'p1', size: 'XL', color: 'White', design: 'Plain' }
    ]
  },
  {
    id: 'p2',
    name: 'Silk Pathani Suit',
    category: "Men's Wear",
    sku: 'MW-002',
    status: 'active',
    variants: [
      { id: 'v4', productId: 'p2', size: 'M', color: 'Beige', design: 'Traditional' },
      { id: 'v5', productId: 'p2', size: 'L', color: 'Brown', design: 'Traditional' }
    ]
  },
  {
    id: 'p3',
    name: 'Linen Nehru Jacket',
    category: "Men's Wear",
    sku: 'MW-003',
    status: 'active',
    variants: [
      { id: 'v6', productId: 'p3', size: 'M', color: 'Navy Blue', design: 'Printed' },
      { id: 'v7', productId: 'p3', size: 'L', color: 'Black', design: 'Solid' }
    ]
  },

  // Ladies' Wear Products
  {
    id: 'p4',
    name: 'Pakistani Suit (Georgette)',
    category: "Ladies' Wear",
    sku: 'LW-001',
    status: 'active',
    variants: [
      { id: 'v8', productId: 'p4', size: 'M', color: 'Pink', design: 'Embroidered' },
      { id: 'v9', productId: 'p4', size: 'L', color: 'Peach', design: 'Embroidered' },
      { id: 'v10', productId: 'p4', size: 'XL', color: 'Red', design: 'Heavy Work' }
    ]
  },
  {
    id: 'p5',
    name: 'Rayon Anarkali Suit',
    category: "Ladies' Wear",
    sku: 'LW-002',
    status: 'active',
    variants: [
      { id: 'v11', productId: 'p5', size: 'S', color: 'Blue', design: 'Floral Print' },
      { id: 'v12', productId: 'p5', size: 'M', color: 'Green', design: 'Block Print' }
    ]
  },
  {
    id: 'p6',
    name: 'Crepe Palazzo Suit Set',
    category: "Ladies' Wear",
    sku: 'LW-003',
    status: 'active',
    variants: [
      { id: 'v13', productId: 'p6', size: 'M', color: 'Yellow', design: 'Contemporary' },
      { id: 'v14', productId: 'p6', size: 'L', color: 'Mint Green', design: 'Modern' }
    ]
  },

  // Kids' Wear Products
  {
    id: 'p7',
    name: 'Cotton Kids Kurta Set',
    category: "Kids' Wear",
    sku: 'KW-001',
    status: 'active',
    variants: [
      { id: 'v15', productId: 'p7', size: '2-3 Years', color: 'White', design: 'Traditional' },
      { id: 'v16', productId: 'p7', size: '4-5 Years', color: 'Cream', design: 'Traditional' },
      { id: 'v17', productId: 'p7', size: '6-7 Years', color: 'White', design: 'Traditional' }
    ]
  },
  {
    id: 'p8',
    name: 'Silk Kids Sherwani',
    category: "Kids' Wear",
    sku: 'KW-002',
    status: 'active',
    variants: [
      { id: 'v18', productId: 'p8', size: '3-4 Years', color: 'Maroon', design: 'Embroidered' },
      { id: 'v19', productId: 'p8', size: '5-6 Years', color: 'Golden', design: 'Designer' }
    ]
  },
  {
    id: 'p9',
    name: 'Net Fabric Kids Lehenga',
    category: "Kids' Wear",
    sku: 'KW-003',
    status: 'active',
    variants: [
      { id: 'v20', productId: 'p9', size: '3-4 Years', color: 'Pink', design: 'Party Wear' },
      { id: 'v21', productId: 'p9', size: '5-6 Years', color: 'Purple', design: 'Festive' }
    ]
  }
];

// ============= BATCHES (Different Materials - Realistic) =============
export const mockBatches: Batch[] = [
  // Men's Wear Batches
  {
    id: 'BTH-001',
    productId: 'p1',
    productName: 'White Cotton Kurta Pajama',
    purchasePrice: 450,
    salePrice: 799,
    quantity: 50,
    remaining: 32,
    supplier: 'Surat Cotton Mills',
    date: '2025-10-15',
    profit: 349
  },
  {
    id: 'BTH-002',
    productId: 'p2',
    productName: 'Silk Pathani Suit',
    purchasePrice: 720,
    salePrice: 1299,
    quantity: 40,
    remaining: 28,
    supplier: 'Banarasi Silk House',
    date: '2025-10-18',
    profit: 579
  },
  {
    id: 'BTH-003',
    productId: 'p3',
    productName: 'Linen Nehru Jacket',
    purchasePrice: 580,
    salePrice: 999,
    quantity: 35,
    remaining: 8,
    supplier: 'Rajasthan Linen Traders',
    date: '2025-10-20',
    profit: 419
  },

  // Ladies' Wear Batches
  {
    id: 'BTH-004',
    productId: 'p4',
    productName: 'Pakistani Suit (Georgette)',
    purchasePrice: 750,
    salePrice: 1499,
    quantity: 60,
    remaining: 35,
    supplier: 'Mumbai Georgette Fabrics',
    date: '2025-10-12',
    profit: 749
  },
  {
    id: 'BTH-005',
    productId: 'p5',
    productName: 'Rayon Anarkali Suit',
    purchasePrice: 480,
    salePrice: 899,
    quantity: 45,
    remaining: 6,
    supplier: 'Delhi Rayon Textiles',
    date: '2025-10-16',
    profit: 419
  },
  {
    id: 'BTH-006',
    productId: 'p6',
    productName: 'Crepe Palazzo Suit Set',
    purchasePrice: 550,
    salePrice: 999,
    quantity: 50,
    remaining: 36,
    supplier: 'Jaipur Crepe Collection',
    date: '2025-10-22',
    profit: 449
  },

  // Kids' Wear Batches
  {
    id: 'BTH-007',
    productId: 'p7',
    productName: 'Cotton Kids Kurta Set',
    purchasePrice: 280,
    salePrice: 549,
    quantity: 55,
    remaining: 38,
    supplier: 'Surat Cotton Mills',
    date: '2025-10-10',
    profit: 269
  },
  {
    id: 'BTH-008',
    productId: 'p8',
    productName: 'Silk Kids Sherwani',
    purchasePrice: 520,
    salePrice: 999,
    quantity: 30,
    remaining: 5,
    supplier: 'Banarasi Silk House',
    date: '2025-10-14',
    profit: 479
  },
  {
    id: 'BTH-009',
    productId: 'p9',
    productName: 'Net Fabric Kids Lehenga',
    purchasePrice: 580,
    salePrice: 1099,
    quantity: 35,
    remaining: 25,
    supplier: 'Ludhiana Net Fabrics',
    date: '2025-10-19',
    profit: 519
  }
];

// ============= BILLS (Realistic Sales Data) =============
export const mockBills: Bill[] = [
  // Bill 1 - Men's Wear
  {
    id: 'bill1',
    billNumber: 'INV-001',
    items: [
      { id: 'item1', productId: 'p1', productName: 'White Cotton Kurta Pajama', batchId: 'BTH-001', quantity: 3, rate: 799, amount: 2397 }
    ],
    subtotal: 2397,
    discount: 0,
    tax: 431.46,
    roundOff: 0.54,
    grandTotal: 2829,
    paymentMethod: 'cash',
    customerName: 'Rajesh Kumar',
    customerPhone: '+91 98765 43210',
    date: '2025-11-01'
  },
  // Bill 2 - Ladies' Wear
  {
    id: 'bill2',
    billNumber: 'INV-002',
    items: [
      { id: 'item2', productId: 'p4', productName: 'Pakistani Suit (Georgette)', batchId: 'BTH-004', quantity: 2, rate: 1499, amount: 2998 },
      { id: 'item3', productId: 'p6', productName: 'Crepe Palazzo Suit Set', batchId: 'BTH-006', quantity: 1, rate: 999, amount: 999 }
    ],
    subtotal: 3997,
    discount: 5,
    tax: 719.46,
    roundOff: 0.54,
    grandTotal: 4317,
    paymentMethod: 'upi',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 12345',
    date: '2025-11-01'
  },
  // Bill 3 - Kids' Wear
  {
    id: 'bill3',
    billNumber: 'INV-003',
    items: [
      { id: 'item4', productId: 'p7', productName: 'Cotton Kids Kurta Set', batchId: 'BTH-007', quantity: 2, rate: 549, amount: 1098 }
    ],
    subtotal: 1098,
    discount: 0,
    tax: 197.64,
    roundOff: 0.36,
    grandTotal: 1296,
    paymentMethod: 'cash',
    customerName: 'Amit Patel',
    customerPhone: '+91 87654 32109',
    date: '2025-11-02'
  },
  // Bill 4 - Men's Wear Mixed
  {
    id: 'bill4',
    billNumber: 'INV-004',
    items: [
      { id: 'item5', productId: 'p2', productName: 'Silk Pathani Suit', batchId: 'BTH-002', quantity: 2, rate: 1299, amount: 2598 },
      { id: 'item6', productId: 'p3', productName: 'Linen Nehru Jacket', batchId: 'BTH-003', quantity: 1, rate: 999, amount: 999 }
    ],
    subtotal: 3597,
    discount: 0,
    tax: 647.46,
    roundOff: 0.54,
    grandTotal: 4245,
    paymentMethod: 'upi',
    customerName: 'Vikram Singh',
    customerPhone: '+91 99887 76655',
    date: '2025-11-02'
  },
  // Bill 5 - Ladies' Wear
  {
    id: 'bill5',
    billNumber: 'INV-005',
    items: [
      { id: 'item7', productId: 'p5', productName: 'Rayon Anarkali Suit', batchId: 'BTH-005', quantity: 3, rate: 899, amount: 2697 }
    ],
    subtotal: 2697,
    discount: 10,
    tax: 485.46,
    roundOff: 0.54,
    grandTotal: 2698,
    paymentMethod: 'credit',
    customerName: 'Sneha Reddy',
    customerPhone: '+91 88776 65544',
    date: '2025-11-03'
  },
  // Bill 6 - Kids' Wear Mixed
  {
    id: 'bill6',
    billNumber: 'INV-006',
    items: [
      { id: 'item8', productId: 'p8', productName: 'Silk Kids Sherwani', batchId: 'BTH-008', quantity: 1, rate: 999, amount: 999 },
      { id: 'item9', productId: 'p9', productName: 'Net Fabric Kids Lehenga', batchId: 'BTH-009', quantity: 1, rate: 1099, amount: 1099 }
    ],
    subtotal: 2098,
    discount: 0,
    tax: 377.64,
    roundOff: 0.36,
    grandTotal: 2476,
    paymentMethod: 'cash',
    customerName: 'Deepak Mehta',
    customerPhone: '+91 77665 54433',
    date: '2025-11-03'
  },
  // Bill 7 - Men's Wear
  {
    id: 'bill7',
    billNumber: 'INV-007',
    items: [
      { id: 'item10', productId: 'p1', productName: 'White Cotton Kurta Pajama', batchId: 'BTH-001', quantity: 5, rate: 799, amount: 3995 }
    ],
    subtotal: 3995,
    discount: 0,
    tax: 719.10,
    roundOff: 0.90,
    grandTotal: 4715,
    paymentMethod: 'upi',
    customerName: 'Suresh Jain',
    customerPhone: '+91 96655 44332',
    date: '2025-11-04'
  },
  // Bill 8 - Ladies' Wear
  {
    id: 'bill8',
    billNumber: 'INV-008',
    items: [
      { id: 'item11', productId: 'p4', productName: 'Pakistani Suit (Georgette)', batchId: 'BTH-004', quantity: 4, rate: 1499, amount: 5996 }
    ],
    subtotal: 5996,
    discount: 5,
    tax: 1079.28,
    roundOff: 0.72,
    grandTotal: 6476,
    paymentMethod: 'credit',
    customerName: 'Kavita Desai',
    customerPhone: '+91 95544 33221',
    date: '2025-11-04'
  },
  // Bill 9 - Mixed Categories
  {
    id: 'bill9',
    billNumber: 'INV-009',
    items: [
      { id: 'item12', productId: 'p1', productName: 'White Cotton Kurta Pajama', batchId: 'BTH-001', quantity: 2, rate: 799, amount: 1598 },
      { id: 'item13', productId: 'p4', productName: 'Pakistani Suit (Georgette)', batchId: 'BTH-004', quantity: 2, rate: 1499, amount: 2998 },
      { id: 'item14', productId: 'p7', productName: 'Cotton Kids Kurta Set', batchId: 'BTH-007', quantity: 3, rate: 549, amount: 1647 }
    ],
    subtotal: 6243,
    discount: 10,
    tax: 1123.74,
    roundOff: 0.26,
    grandTotal: 6805,
    paymentMethod: 'upi',
    customerName: 'Ramesh Gupta',
    customerPhone: '+91 94433 22110',
    date: '2025-11-05'
  },
  // Bill 10 - Ladies' and Kids' Wear
  {
    id: 'bill10',
    billNumber: 'INV-010',
    items: [
      { id: 'item15', productId: 'p5', productName: 'Rayon Anarkali Suit', batchId: 'BTH-005', quantity: 2, rate: 899, amount: 1798 },
      { id: 'item16', productId: 'p9', productName: 'Net Fabric Kids Lehenga', batchId: 'BTH-009', quantity: 2, rate: 1099, amount: 2198 }
    ],
    subtotal: 3996,
    discount: 5,
    tax: 719.28,
    roundOff: 0.72,
    grandTotal: 4316,
    paymentMethod: 'cash',
    customerName: 'Neha Kapoor',
    customerPhone: '+91 93322 11009',
    date: '2025-11-05'
  }
];

// ============= DASHBOARD STATS =============
export const mockDashboardStats: DashboardStats = {
  billsToday: 10,
  totalSales: 40169,
  activeBatches: 9,
  profitMargin: 45.8
};
