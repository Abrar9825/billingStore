import { create } from 'zustand';
import { Product, Batch, Bill, BillItem, DashboardStats, Category } from './types';
import { mockProducts, mockBatches, mockDashboardStats, mockCategories, mockBills } from '../data/mockData';

interface AppState {
  // Data
  products: Product[];
  batches: Batch[];
  // customers and expenses removed
  bills: Bill[];
  dashboardStats: DashboardStats;
  categories: Category[];

  // Current bill state
  currentBill: BillItem[];

  // Actions
  addProductToBill: (productId: string, batchId: string, quantity: number, rate: number) => void;
  removeFromBill: (itemId: string) => void;
  updateBillItem: (itemId: string, quantity: number, rate: number) => void;
  clearBill: () => void;
  saveBill: (paymentMethod: 'cash' | 'upi' | 'credit', customerId?: string) => void;

  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatch: (id: string, updates: Partial<Batch>) => void;
  deleteBatch: (id: string) => void;

  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
toggleProductStatus: (id: string) => void;
  

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial data
  products: mockProducts,
  batches: mockBatches,
  // removed customers and expenses initial data
  bills: mockBills,
  dashboardStats: mockDashboardStats,
  categories: mockCategories,
  currentBill: [],

  // Bill actions
  addProductToBill: (productId, batchId, quantity, rate) => {
    const product = get().products.find(p => p.id === productId);
    if (!product) return;

    const newItem: BillItem = {
      id: Date.now().toString(),
      productId,
      productName: product.name,
      batchId,
      quantity,
      rate,
      amount: quantity * rate
    };

    set(state => ({
      currentBill: [...state.currentBill, newItem]
    }));
  },

  removeFromBill: (itemId) => {
    set(state => ({
      currentBill: state.currentBill.filter(item => item.id !== itemId)
    }));
  },

  updateBillItem: (itemId, quantity, rate) => {
    set(state => ({
      currentBill: state.currentBill.map(item =>
        item.id === itemId ? { ...item, quantity, rate, amount: quantity * rate } : item
      )
    }));
  },

  clearBill: () => {
    set({ currentBill: [] });
  },

  saveBill: (paymentMethod, customerId) => {
    const currentBill = get().currentBill;
    if (currentBill.length === 0) return;

    const subtotal = currentBill.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * 0.18; // 18% GST
    const grandTotal = subtotal + tax;

    const newBill: Bill = {
      id: Date.now().toString(),
      items: currentBill,
      subtotal,
      discount: 0,
      tax,
      roundOff: 0,
      grandTotal,
      paymentMethod,
      customerId,
      date: new Date().toISOString(),
      billNumber: ''
    };

    set(state => ({
      bills: [...state.bills, newBill],
      currentBill: [],
      dashboardStats: {
        ...state.dashboardStats,
        billsToday: state.dashboardStats.billsToday + 1,
        totalSales: state.dashboardStats.totalSales + grandTotal
      }
    }));
  },

  // Batch actions
  addBatch: (batch) => {
    const newBatch: Batch = {
      ...batch,
      id: `B${Date.now().toString().slice(-3)}`
    };
    set(state => ({
      batches: [...state.batches, newBatch]
    }));
  },

  updateBatch: (id, updates) => {
    set(state => ({
      batches: state.batches.map(batch => batch.id === id ? { ...batch, ...updates } : batch)
    }));
  },

  deleteBatch: (id) => {
    set(state => ({
      batches: state.batches.filter(batch => batch.id !== id)
    }));
  },

  // Product actions
  addProduct: (product) => {
    const newProduct: Product = {
      ...product,
      id: `p${Date.now()}`
    };
    set(state => ({
      products: [...state.products, newProduct]
    }));
  },

  updateProduct: (id, updates) => {
    set(state => ({
      products: state.products.map(product => product.id === id ? { ...product, ...updates } : product)
    }));
  },
// Toggle product active/inactive
toggleProductStatus: (id: string) => {
  set(state => ({
    products: state.products.map(product =>
      product.id === id
        ? { ...product, status: product.status === 'inactive' ? 'active' : 'inactive' }
        : product
    )
  }));
},

  // Expense support removed

  // Category actions
  addCategory: (category) => {
    const newCategory: Category = {
      ...category,
      id: `c${Date.now()}`
    };
    set(state => ({
      categories: [...state.categories, newCategory]
    }));
  },

  updateCategory: (id, updates) => {
    set(state => ({
      categories: state.categories.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
    }));
  },

  deleteCategory: (id) => {
    set(state => ({
      categories: state.categories.filter(cat => cat.id !== id)
    }));
  }
}));


