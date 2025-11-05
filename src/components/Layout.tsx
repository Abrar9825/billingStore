import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Receipt, 
  Settings,
  Menu,
  X,
  Bell,
  User,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Layers } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/lib/store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Billing', href: '/billing', icon: FileText },
  { name: 'Batches', href: '/batches', icon: Package },
  { name: 'Products', href: '/products', icon: ShoppingCart },
  { name: 'Categories', href: '/categoryManagement', icon: Layers }, // <-- added
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Remove extra hamburgerActive state, use sidebarOpen only
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();
  const { batches } = useStore();
  
  // Find low stock batches
  const lowStockBatches = batches.filter(batch => batch.remaining <= 10);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex h-full flex-col bg-white shadow-2xl">
          {/* Logo Header */}
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 shadow-lg flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-gray-900">
                  {import.meta.env.VITE_APP_NAME}
                </span>
                <span className="text-xs text-gray-500">Billing System</span>
              </div>
            </div>
            {/* Only show close (X) when sidebar is open */}
            {sidebarOpen && (
              <button
                className="lg:hidden focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close sidebar"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-500/20 animate-pulse"></div>
                  )}
                  <item.icon className={`
                    mr-3 h-5 w-5 relative z-10 transition-transform duration-200 
                    ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600 group-hover:scale-110'}
                  `} />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <div className="ml-auto relative z-10">
                      <div className="h-2 w-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>v2.0.1</span>
              <span>© 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className={`flex h-16 items-center px-4 sm:px-6 glass border-b border-white/20 ${sidebarOpen ? 'pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-4 flex-1">
            {/* Only show hamburger when sidebar is closed */}
            {!sidebarOpen && (
              <button
                className="lg:hidden focus:outline-none"
                aria-label="Open sidebar"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="block w-7 h-7 relative cursor-pointer transition-all duration-300 group">
                  <span className="absolute left-0 top-2 w-7 h-1 bg-gray-800 rounded"></span>
                  <span className="absolute left-0 top-1/2 w-7 h-1 bg-gray-800 rounded"></span>
                  <span className="absolute left-0 top-0.5 w-7 h-1 bg-gray-800 rounded"></span>
                </span>
              </button>
            )}
            {/* Removed search bar for cleaner header */}
          </div>
          {/* Profile dropdown always in header (mobile + desktop) */}
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium">Juveriyah</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}