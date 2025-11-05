import { FileText, DollarSign, Package, TrendingUp, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/StatCard';
import { useStore } from '@/lib/store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { useState } from 'react';

const salesData = [
  { name: 'Mon', sales: 4000, profit: 2400 },
  { name: 'Tue', sales: 3000, profit: 1398 },
  { name: 'Wed', sales: 2000, profit: 9800 },
  { name: 'Thu', sales: 2780, profit: 3908 },
  { name: 'Fri', sales: 1890, profit: 4800 },
  { name: 'Sat', sales: 2390, profit: 3800 },
  { name: 'Sun', sales: 3490, profit: 4300 },
];

export default function Dashboard() {
  const { dashboardStats, batches, bills } = useStore();
  // Find low stock batches
  const lowStockBatches = batches.filter(batch => batch.remaining <= 10);
  const [showAlert, setShowAlert] = useState(false);

  // Calculate today's stats from actual bills
  const today = new Date().toLocaleDateString('en-IN');
  const todayBills = bills.filter(bill => new Date(bill.date).toLocaleDateString('en-IN') === today);
  const todaySales = todayBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  
  // Calculate total profit from all bills
  const totalProfit = bills.reduce((sum, bill) => {
    return sum + bill.items.reduce((itemSum, item) => {
      const batch = batches.find(b => b.id === item.batchId);
      return itemSum + (batch ? (item.rate - batch.purchasePrice) * item.quantity : 0);
    }, 0);
  }, 0);
  
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // Active batches (with remaining stock)
  const activeBatchesCount = batches.filter(batch => batch.remaining > 0).length;

  return (
    <div className="space-y-6 fade-in relative">
      {/* Top right notification icon */}
      <div className="absolute right-4 top-4 z-20">
        <Button variant="ghost" size="sm" className="relative" onClick={() => setShowAlert((v) => !v)}>
          <Bell className="h-5 w-5 text-blue-600" />
          {lowStockBatches.length > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500">
              {lowStockBatches.length}
            </Badge>
          )}
        </Button>
        {/* Show Low Stock Alert dropdown if any and toggled */}
        {showAlert && lowStockBatches.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow px-3 py-2 min-w-[220px] mt-2 absolute right-0">
            <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
              <Bell className="h-4 w-4" />
              <span>Low Stock Alert</span>
            </div>
            <ul className="space-y-1">
              {lowStockBatches.map(batch => (
                <li key={batch.id} className="flex items-center justify-between text-xs">
                  <span className="font-medium">{batch.productName}</span>
                  <Badge variant="destructive" className="ml-2">{batch.remaining} left</Badge>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {/* Greeting Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👋 Welcome back, Juveriyah!
        </h1>
        <p className="text-lg text-gray-600">Here's your business pulse today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Bills Today"
          value={todayBills.length}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Total Sales"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Active Batches"
          value={activeBatchesCount}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="Profit Margin"
          value={`${profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Charts Section: Sales Trend and Profit Chart side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card className="glass border-white/20 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Sales Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="sales" fill="url(#salesGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Profit Chart (Line) */}
        <Card className="glass border-white/20 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Profit Trend</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}