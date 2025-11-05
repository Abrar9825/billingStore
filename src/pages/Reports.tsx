import { useState } from 'react';
import { BarChart3, TrendingUp, Download, Calendar, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useStore } from '@/lib/store';

export default function Reports() {
  const { batches, bills, products, categories } = useStore();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [activeTab, setActiveTab] = useState('sales');

  // Calculate daily sales data from actual bills
  const getDailySalesData = () => {
    const dailyData: Record<string, { sales: number; profit: number }> = {};
    
    bills.forEach(bill => {
      const date = new Date(bill.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyData[dayName]) {
        dailyData[dayName] = { sales: 0, profit: 0 };
      }
      
      dailyData[dayName].sales += bill.grandTotal;
      
      // Calculate profit
      bill.items.forEach(item => {
        const batch = batches.find(b => b.id === item.batchId);
        if (batch) {
          dailyData[dayName].profit += (item.rate - batch.purchasePrice) * item.quantity;
        }
      });
    });

    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return daysOrder.map(day => ({
      name: day,
      sales: Math.round(dailyData[day]?.sales || 0),
      profit: Math.round(dailyData[day]?.profit || 0)
    }));
  };

  // Calculate category-wise sales from actual bills
  const getCategoryData = () => {
    const categoryStats: Record<string, number> = {};
    let totalRevenue = 0;

    bills.forEach(bill => {
      bill.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          if (!categoryStats[product.category]) {
            categoryStats[product.category] = 0;
          }
          categoryStats[product.category] += item.amount;
          totalRevenue += item.amount;
        }
      });
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return Object.entries(categoryStats).map(([name, value], index) => ({
      name,
      value: Math.round((value / totalRevenue) * 100),
      color: colors[index % colors.length]
    }));
  };

  // Get top performing products from actual bills
  const getTopProducts = () => {
    const productStats: Record<string, { sales: number; revenue: number }> = {};

    bills.forEach(bill => {
      bill.items.forEach(item => {
        if (!productStats[item.productName]) {
          productStats[item.productName] = { sales: 0, revenue: 0 };
        }
        productStats[item.productName].sales += item.quantity;
        productStats[item.productName].revenue += item.amount;
      });
    });

    return Object.entries(productStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const salesData = getDailySalesData();
  const categoryData = getCategoryData();
  const topProducts = getTopProducts();

  // Calculate product-wise profit for pie chart
  const getProductProfitData = () => {
    const productProfits: Record<string, number> = {};
    
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const batch = batches.find(b => b.id === item.batchId);
        if (batch) {
          const profit = (item.rate - batch.purchasePrice) * item.quantity;
          if (productProfits[item.productName]) {
            productProfits[item.productName] += profit;
          } else {
            productProfits[item.productName] = profit;
          }
        }
      });
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
    return Object.entries(productProfits).map(([name, value], index) => ({
      name,
      value: Math.round(value),
      color: colors[index % colors.length]
    }));
  };

  // Filter bills by date range
  const filteredBills = bills.filter(bill => {
    if (!fromDate && !toDate) return true;
    const billDate = new Date(bill.date);
    const from = fromDate ? new Date(fromDate) : new Date('1900-01-01');
    const to = toDate ? new Date(toDate) : new Date('2100-12-31');
    return billDate >= from && billDate <= to;
  });

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalProfit = filteredBills.reduce((sum, bill) => {
    return sum + bill.items.reduce((itemSum, item) => {
      const batch = batches.find(b => b.id === item.batchId);
      return itemSum + (batch ? (item.rate - batch.purchasePrice) * item.quantity : 0);
    }, 0);
  }, 0);

  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  const productProfitData = getProductProfitData();

  // Export functions
  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header.toLowerCase().replace(/ /g, '_')];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    switch (activeTab) {
      case 'sales':
        const salesExportData = salesData.map(item => ({
          day: item.name,
          sales: item.sales,
          profit: item.profit
        }));
        exportToCSV(salesExportData, 'Sales_Report', ['Day', 'Sales', 'Profit']);
        break;

      case 'profit':
        const profitExportData = salesData.map(item => ({
          day: item.name,
          revenue: item.sales,
          profit: item.profit,
          profit_margin: item.sales > 0 ? ((item.profit / item.sales) * 100).toFixed(2) + '%' : '0%'
        }));
        exportToCSV(profitExportData, 'Profit_Report', ['Day', 'Revenue', 'Profit', 'Profit_Margin']);
        break;

      case 'products':
        const productsExportData = topProducts.map(product => ({
          product_name: product.name,
          units_sold: product.sales,
          revenue: product.revenue
        }));
        exportToCSV(productsExportData, 'Products_Report', ['Product_Name', 'Units_Sold', 'Revenue']);
        break;

      case 'batches':
        const batchesExportData = batches.map(batch => {
          const soldQty = batch.quantity - batch.remaining;
          const batchProfit = batch.profit * soldQty;
          return {
            batch_id: batch.id,
            product: batch.productName,
            purchase_price: batch.purchasePrice,
            sale_price: batch.salePrice,
            quantity: batch.quantity,
            sold: soldQty,
            remaining: batch.remaining,
            profit: batchProfit,
            supplier: batch.supplier,
            date: batch.date
          };
        });
        exportToCSV(batchesExportData, 'Batches_Report', 
          ['Batch_ID', 'Product', 'Purchase_Price', 'Sale_Price', 'Quantity', 'Sold', 'Remaining', 'Profit', 'Supplier', 'Date']);
        break;

      case 'bills':
        const billsExportData = filteredBills.map(bill => {
          const billProfit = bill.items.reduce((sum, item) => {
            const batch = batches.find(b => b.id === item.batchId);
            return sum + (batch ? (item.rate - batch.purchasePrice) * item.quantity : 0);
          }, 0);
          
          return {
            bill_number: bill.billNumber,
            customer_name: bill.customerName || 'Walk-in Customer',
            customer_phone: bill.customerPhone || 'N/A',
            items_count: bill.items.length,
            subtotal: bill.subtotal,
            tax: bill.tax,
            total: bill.grandTotal,
            profit: billProfit,
            payment_method: bill.paymentMethod,
            date: new Date(bill.date).toLocaleDateString()
          };
        });
        exportToCSV(billsExportData, 'Bills_History_Report', 
          ['Bill_Number', 'Customer_Name', 'Customer_Phone', 'Items_Count', 'Subtotal', 'Tax', 'Total', 'Profit', 'Payment_Method', 'Date']);
        break;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 fade-in p-4 md:p-0">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col gap-4">
        <h1 className="text-lg md:text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        
        {/* Date filters and export - Mobile optimized */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>Filter:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Input
                type="date"
                placeholder="From"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full sm:w-32 h-8 text-xs"
              />
              <span className="text-gray-500 text-xs self-center hidden sm:inline">to</span>
              <Input
                type="date"
                placeholder="To"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full sm:w-32 h-8 text-xs"
              />
            </div>
          </div>
          <Button 
            onClick={handleExport}
            size="sm"
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full sm:w-auto"
          >
            <Download className="h-3 w-3 mr-1" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4 md:space-y-6" onValueChange={setActiveTab}>
        {/* Mobile-friendly scrollable tabs */}
        <div className="w-full overflow-x-auto responsive-tabs">
          <TabsList className="responsive-tabs-list inline-flex h-8 md:h-10 items-center justify-start w-max md:w-full md:grid md:grid-cols-5 gap-1 p-1 bg-muted rounded-lg">
            <TabsTrigger value="sales" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 whitespace-nowrap min-w-max">
              Sales
            </TabsTrigger>
            <TabsTrigger value="profit" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 whitespace-nowrap min-w-max">
              Profit
            </TabsTrigger>
            <TabsTrigger value="products" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 whitespace-nowrap min-w-max">
              Products
            </TabsTrigger>
            <TabsTrigger value="batches" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 whitespace-nowrap min-w-max">
              Batches
            </TabsTrigger>
            <TabsTrigger value="bills" className="text-xs md:text-sm px-3 md:px-4 py-1 md:py-2 whitespace-nowrap min-w-max">
              Bills
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4 md:space-y-6">
          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            <Card className="glass border-white/20 hover-lift">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-lg md:text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                    <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20 hover-lift">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-lg md:text-2xl font-bold text-blue-600">{filteredBills.length}</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                    <BarChart3 className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20 hover-lift">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Avg Order Value</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600">
                      ₹{filteredBills.length > 0 ? (totalRevenue / filteredBills.length).toFixed(0) : '0'}
                    </p>
                  </div>
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                    <Calendar className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sales Chart - Responsive */}
          <Card className="glass border-white/20 hover-lift">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-base">Sales Trend</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <ResponsiveContainer width="100%" height={250} className="md:h-[400px]">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Tab */}
        <TabsContent value="profit" className="space-y-4 md:space-y-6">
          {/* Profit Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            <Card className="glass border-white/20 hover-lift">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Profit</p>
                    <p className="text-lg md:text-2xl font-bold text-green-600">₹{totalProfit.toLocaleString()}</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                    <TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20 hover-lift">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Profit Margin</p>
                    <p className="text-lg md:text-2xl font-bold text-blue-600">{profitMargin.toFixed(1)}%</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                    <BarChart3 className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass border-white/20 hover-lift">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600">₹{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="p-2 md:p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                    <FileText className="h-4 w-4 md:h-6 md:w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card className="glass border-white/20 hover-lift">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-base">Profit vs Revenue</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass border-white/20 hover-lift">
              <CardHeader className="p-3 md:p-6">
                <CardTitle className="text-sm md:text-base">Sales by Category</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4 md:space-y-6">
          <Card className="glass border-white/20 hover-lift">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-base">Top Performing Products</CardTitle>
            </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <div className="space-y-3 md:space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.name} className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-white/50">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs md:text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm md:text-base">{product.name}</p>
                          <p className="text-xs md:text-sm text-gray-600">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 text-sm md:text-base">₹{product.revenue.toLocaleString()}</p>
                        <p className="text-xs md:text-sm text-gray-600">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-4 md:space-y-6">
          <Card className="glass border-white/20 hover-lift">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="text-sm md:text-base">Batch Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              <div className="space-y-3 md:space-y-4">
                {batches.slice(0, 5).map((batch) => {
                  const soldQty = batch.quantity - batch.remaining;
                  const soldPercentage = (soldQty / batch.quantity) * 100;
                  const batchProfitAmount = batch.profit * soldQty;

                  return (
                    <div key={batch.id} className="p-3 md:p-4 rounded-lg bg-white/50">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm md:text-base">{batch.productName}</p>
                          <p className="text-xs md:text-sm text-gray-600">Batch #{batch.id}</p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-sm md:text-base ${batchProfitAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {batchProfitAmount < 0 
                              ? `-₹${Math.abs(batchProfitAmount).toLocaleString()} (Loss)` 
                              : `₹${batchProfitAmount.toLocaleString()}`}
                          </p>
                          <p className="text-xs md:text-sm text-gray-600">Total Profit</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs md:text-sm text-gray-600 mt-1">
                        <span>{soldQty} sold</span>
                        <span>{batch.remaining} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4 md:space-y-6">
          <Card className="glass border-white/20 hover-lift">
            <CardHeader className="p-3 md:p-6">
              <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <span>Bills History</span>
                <Badge variant="secondary" className="text-xs">{filteredBills.length} bills</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-6 pt-0">
              {filteredBills.length > 0 ? (
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Bill No.</TableHead>
                        <TableHead className="text-xs">Customer</TableHead>
                        <TableHead className="text-xs">Items</TableHead>
                        <TableHead className="text-xs">Profit/Loss</TableHead>
                        <TableHead className="text-xs">Payment</TableHead>
                        <TableHead className="text-xs">Date</TableHead>
                        <TableHead className="text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBills.map((bill) => {
                        const billProfit = bill.items.reduce((sum, item) => {
                          const batch = batches.find(b => b.id === item.batchId);
                          return sum + (batch ? (item.rate - batch.purchasePrice) * item.quantity : 0);
                        }, 0);

                        return (
                          <TableRow key={bill.id} className="hover:bg-white/50">
                            <TableCell className="font-medium">
                              <Badge variant="outline" className="text-xs">{bill.billNumber}</Badge>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{bill.customerName || 'Walk-in Customer'}</p>
                                {bill.customerPhone && (
                                  <p className="text-xs text-gray-600">{bill.customerPhone}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{bill.items.length} items</TableCell>
                            <TableCell className={`font-medium text-sm ${billProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {billProfit < 0 
                                ? `-₹${Math.abs(billProfit).toLocaleString()} (Loss)` 
                                : `₹${billProfit.toLocaleString()}`}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={bill.paymentMethod === 'cash' ? 'default' : 
                                       bill.paymentMethod === 'upi' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {bill.paymentMethod.toUpperCase()}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{new Date(bill.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-full sm:max-w-2xl w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                                  <span className="sr-only">
                                    <DialogDescription>Bill details dialog</DialogDescription>
                                  </span>
                                  <DialogHeader>
                                    <DialogTitle className="text-sm sm:text-base">Bill Details - {bill.billNumber}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                      <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Customer</p>
                                        <p className="font-medium text-sm sm:text-base">{bill.customerName || 'Walk-in Customer'}</p>
                                        {bill.customerPhone && <p className="text-xs sm:text-sm">{bill.customerPhone}</p>}
                                      </div>
                                      <div>
                                        <p className="text-xs sm:text-sm text-gray-600">Date</p>
                                        <p className="font-medium text-sm sm:text-base">{new Date(bill.date).toLocaleDateString()}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Items</p>
                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader>
                                            <TableRow>
                                              <TableHead className="text-[10px] sm:text-xs px-2 sm:px-4">Product</TableHead>
                                              <TableHead className="text-[10px] sm:text-xs px-2 sm:px-4">Qty</TableHead>
                                              <TableHead className="text-[10px] sm:text-xs px-2 sm:px-4">Rate</TableHead>
                                              <TableHead className="text-[10px] sm:text-xs px-2 sm:px-4">Amount</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {bill.items.map((item) => (
                                              <TableRow key={item.id}>
                                                <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4">{item.productName}</TableCell>
                                                <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4">{item.quantity}</TableCell>
                                                <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4">₹{item.rate}</TableCell>
                                                <TableCell className="text-[10px] sm:text-sm px-2 sm:px-4">₹{item.amount}</TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>

                                    <div className="border-t pt-3 sm:pt-4 space-y-1.5 sm:space-y-2">
                                      <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">₹{bill.subtotal.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-xs sm:text-sm text-green-600">
                                        <span>Discount ({bill.discount || 0}%):</span>
                                        <span>- ₹{((bill.subtotal * (bill.discount || 0)) / 100).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">CGST (9%):</span>
                                        <span className="font-medium">₹{(bill.cgst !== undefined ? bill.cgst : (bill.tax / 2)).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">SGST (9%):</span>
                                        <span className="font-medium">₹{(bill.sgst !== undefined ? bill.sgst : (bill.tax / 2)).toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs sm:text-sm">
                                        <span className="text-gray-600">GST Total (18%):</span>
                                        <span className="font-medium">₹{bill.tax.toFixed(2)}</span>
                                      </div>
                                      {bill.roundOff !== 0 && (
                                        <div className="flex justify-between text-xs sm:text-sm">
                                          <span className="text-gray-600">Round Off:</span>
                                          <span className="font-medium">₹{bill.roundOff.toFixed(2)}</span>
                                        </div>
                                      )}
                                      <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                                        <span>Grand Total:</span>
                                        <span className="text-green-600">₹{bill.grandTotal.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between text-xs sm:text-sm pt-2 border-t">
                                        <span className="text-gray-600">Total Profit:</span>
                                        <span className="font-bold text-green-600">
                                          ₹{bill.items.reduce((sum, item) => {
                                            const batch = batches.find(b => b.id === item.batchId);
                                            return sum + (batch ? (item.rate - batch.purchasePrice) * item.quantity : 0);
                                          }, 0).toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-sm">No bills found</p>
                    <p className="text-xs mt-1">Create some bills to see history</p>
                  </div>
                </div>
              )}

              {/* Mobile Card Layout */}
              <div className="block md:hidden space-y-3">
                {filteredBills.map((bill) => {
                  const billProfit = bill.items.reduce((sum, item) => {
                    const batch = batches.find(b => b.id === item.batchId);
                    return sum + (batch ? (item.rate - batch.purchasePrice) * item.quantity : 0);
                  }, 0);

                  return (
                    <div key={bill.id} className="p-3 rounded-lg bg-white/50 border">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Badge variant="outline" className="text-xs mb-1">{bill.billNumber}</Badge>
                          <p className="font-medium text-sm">{bill.customerName || 'Walk-in Customer'}</p>
                          {bill.customerPhone && (
                            <p className="text-xs text-gray-600">{bill.customerPhone}</p>
                          )}
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-full sm:max-w-sm w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
                            <span className="sr-only">
                              <DialogDescription>Bill details dialog</DialogDescription>
                            </span>
                            <DialogHeader>
                              <DialogTitle className="text-sm sm:text-base">Bill Details - {bill.billNumber}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-2 sm:space-y-3">
                              <div>
                                <p className="text-[10px] sm:text-xs text-gray-600">Customer</p>
                                <p className="font-medium text-xs sm:text-sm">{bill.customerName || 'Walk-in Customer'}</p>
                                {bill.customerPhone && <p className="text-[10px] sm:text-xs">{bill.customerPhone}</p>}
                              </div>
                              <div>
                                <p className="text-[10px] sm:text-xs text-gray-600">Date</p>
                                <p className="font-medium text-xs sm:text-sm">{new Date(bill.date).toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-[10px] sm:text-xs text-gray-600 mb-1">Items</p>
                                <div className="max-h-40 overflow-y-auto">
                                  {bill.items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-[10px] sm:text-xs py-1 border-b last:border-0">
                                      <span className="flex-1 pr-2">{item.productName} x{item.quantity}</span>
                                      <span className="font-medium whitespace-nowrap">₹{item.amount}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="border-t pt-2 space-y-1">
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span>Subtotal:</span>
                                  <span>₹{bill.subtotal}</span>
                                </div>
                                <div className="flex justify-between text-[10px] sm:text-xs text-green-600">
                                  <span>Discount ({bill.discount || 0}%):</span>
                                  <span>- ₹{((bill.subtotal * (bill.discount || 0)) / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span>CGST (9%):</span>
                                  <span>₹{(bill.cgst !== undefined ? bill.cgst : (bill.tax / 2)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-[10px] sm:text-xs">
                                  <span>SGST (9%):</span>
                                  <span>₹{(bill.sgst !== undefined ? bill.sgst : (bill.tax / 2)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-xs sm:text-sm border-t pt-1">
                                  <span>Total:</span>
                                  <span>₹{bill.grandTotal}</span>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>{bill.items.length} items</span>
                        <span className={`font-medium ${billProfit < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {billProfit < 0 
                            ? `-₹${Math.abs(billProfit).toLocaleString()}` 
                            : `₹${billProfit.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge 
                          variant={bill.paymentMethod === 'cash' ? 'default' : 
                                 bill.paymentMethod === 'upi' ? 'secondary' : 'outline'}
                          className="text-xs"
                        >
                          {bill.paymentMethod.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-gray-600">{new Date(bill.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
