import React, { useState, useEffect } from 'react';
import { useToast, toastUtils } from '../../components/ui/use-toast';
import StatCard from '../../components/ui/StatCard';
import DataTable from '../../components/ui/DataTable';
import { 
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { inventoryService, orderService, reportService } from '../../api';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import PageHeader from '../../components/ui/PageHeader';
import { DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { COLORS, PIE_CHART_COLORS } from '../../constants/theme.js';

const Reports = () => {
  const { toast } = useToast();
  const [inventoryValue, setInventoryValue] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [stockMovementData, setStockMovementData] = useState([]);
  const [topProductsData, setTopProductsData] = useState([]);
  const [slowMovingData, setSlowMovingData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [orderValueData, setOrderValueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch inventory value
        const invValue = await inventoryService.getInventoryValue();
        setInventoryValue(invValue || 0);

        // Fetch recent transactions
        const transactions = await inventoryService.getRecentTransactions(5);
        setRecentTransactions(transactions || []);

        // Fetch order data for status distribution
        const orders = await orderService.getAllOrders(0, 100, 'orderDate', 'desc');
        const statusCounts = orders.content.reduce((acc, order) => {
          acc[order.status] = (acc[order.status] || 0) + 1;
          return acc;
        }, {});
        const statusData = Object.entries(statusCounts).map(([status, count]) => ({ name: status, value: count }));
        setOrderStatusData(statusData);

        // Fetch stock movement data
        const stockMovement = await reportService.getStockMovementData(
          dateRange.startDate, 
          dateRange.endDate
        );
        setStockMovementData(stockMovement);

        // Fetch top selling products
        const topProducts = await reportService.getTopSellingProducts(30, 5);
        setTopProductsData(topProducts);

        // Fetch slow moving products
        const slowMoving = await reportService.getSlowMovingProducts(30, 5);
        setSlowMovingData(slowMoving);

        // Fetch supplier contribution
        const supplierContribution = await reportService.getSupplierContribution(90);
        
        // Group suppliers with less than 2.5% share into "Others" category
        if (supplierContribution && supplierContribution.length > 0) {
          const totalValue = supplierContribution.reduce((sum, item) => sum + item.value, 0);
          const threshold = totalValue * 0.025; // 2.5% threshold
          
          const mainSuppliers = [];
          let othersValue = 0;
          
          supplierContribution.forEach(supplier => {
            if (supplier.value >= threshold) {
              mainSuppliers.push(supplier);
            } else {
              othersValue += supplier.value;
            }
          });
          
          // Add "Others" category if there are any small suppliers
          if (othersValue > 0) {
            mainSuppliers.push({
              name: 'Others',
              value: othersValue
            });
          }
          
          setSupplierData(mainSuppliers);
        } else {
          setSupplierData([]);
        }

        // Fetch order value trend
        const orderValueTrend = await reportService.getOrderValueTrend(6);
        setOrderValueData(orderValueTrend);

        setLoading(false);
      } catch (error) {
        toastUtils.patterns.reports.loadFailed(toast);
        console.error('Error fetching report data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [toast, dateRange]);

  // Columns for recent transactions table
  const transactionColumns = [
    { 
      accessor: 'transactionType', 
      header: 'Type',
    },
    { 
      accessor: 'productName', 
      header: 'Product',
    },
    { 
      accessor: 'quantity', 
      header: 'Quantity',
    },
    { 
      accessor: (item) => {
        try {
          let date;
          // Handle array format [year, month, day, hour, minute, second, nano]
          if (Array.isArray(item.transactionDate)) {
            const [year, month, day, hour, minute, second] = item.transactionDate;
            // Note: JavaScript months are 0-indexed, but the API returns 1-indexed months
            date = new Date(year, month - 1, day, hour, minute, second);
          } else {
            date = new Date(item.transactionDate);
          }
          return format(date, 'MMM dd, yyyy HH:mm');
        } catch (error) {
          console.error('Date formatting error:', error);
          return 'Invalid date';
        }
      },
      header: 'Date',
    },
  ];

  // Columns for slow moving products table
  const slowMovingColumns = [
    { accessor: 'name', header: 'Product'},
    { accessor: 'sku', header: 'SKU'},
    { accessor: 'currentStock', header: 'Current Stock'},
    { accessor: 'sales', header: 'Sales'},
    { accessor: 'daysInStock', header: 'Days in Stock'},
  ];

  // Helper function to get color for order status
  const getColorForStatus = (status) => {
    const colors = {
      'PENDING': COLORS.WARNING,
      'PROCESSING': COLORS.INFO,
      'DELIVERED': COLORS.SUCCESS,
      'CANCELLED': COLORS.DANGER,
      'COMPLETED': COLORS.PURPLE,
    };
    return colors[status] || COLORS.DEFAULT;
  };

  // Format date for display
  const formatDate = (dateValue) => {
    try {
      let date;
      if (Array.isArray(dateValue)) {
        const [year, month, day] = dateValue;
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(dateValue);
      }
      return format(date, 'MMM dd');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Reports" 
        description="Analyze your inventory and sales performance"
        icon={<PieChartIcon />}
        iconBgColor="bg-blue-100"
        iconColor="text-blue-600"
      />

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex items-center justify-center">
          <StatCard
            title="Total Inventory Value" 
            value={`$${(inventoryValue || 0).toLocaleString()}`} 
            iconBgColor={"bg-green-100"}
            iconColor={"text-green-600"}
            icon={<DollarSign/>}
          />
        </div>
        <div className="md:col-span-2">
              <DataTable
                data={recentTransactions}
                columns={transactionColumns}
                keyField="id"
                loading={loading}
                pageSize={5}
              />
        </div>
      </section>

      {/* Stock Movement Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movement Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockMovementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} minTickGap={30} />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => formatDate(label)}
                  formatter={(value, name) => {
                    if (name === 'stockIn') return [value, 'Stock In'];
                    if (name === 'stockOut') return [value, 'Stock Out'];
                    return [value, name];
                  }}
                />
                <Line type="monotone" dataKey="stockIn" stroke="#22c55e" name="stockIn" />
                <Line type="monotone" dataKey="stockOut" stroke="#ef4444" name="stockOut" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Order Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getColorForStatus(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Orders']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Value Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={orderValueData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [value, 'Units Sold']}
                    labelFormatter={(name) => `Product: ${name}`}
                  />
                  <Bar dataKey="sales" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Slow Moving Items</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={slowMovingData}
              columns={slowMovingColumns}
              keyField="id"
              loading={loading}
              pageSize={5}
            />
          </CardContent>
        </Card>
      </div>

      {/* Supplier Contribution */}
      <Card>
        <CardHeader>
          <CardTitle>Supplier Contribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={supplierData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {supplierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_CHART_COLORS[index % PIE_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
