import { useEffect, useState } from 'react';
import { Package, ShoppingCart, AlertTriangle, DollarSign, TrendingUp, Activity } from 'lucide-react';
import StatCard from '../components/ui/StatCard';
import RecentOrders from '../components/dashboard/RecentOrders';
import LowStockItems from '../components/dashboard/LowStockItems';
import { motion } from 'framer-motion';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import axiosClient from '../api/axiosClient';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setFetchError(null);

    // Parallel API calls for dashboard data—fastest performance
    Promise.all([
      axiosClient.get('/dashboard/stats'),
      axiosClient.get('/dashboard/sales', { params: { months: 6 } }),
    ])
      .then(([statsRes, salesRes]) => {
        setStats(statsRes.data);
        setSalesData(
          salesRes.data.map(item => ({
            name: item.month, // should be 'Jan', 'Feb', etc.
            sales: item.sales,
          }))
        );
        setLoading(false);
      })
      .catch(error => {
        setLoading(false);
        setFetchError(error?.message || "Failed to load dashboard data");
      });
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-gray-600 font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex justify-center items-center h-full min-h-screen">
        <div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <span className="text-red-600 font-medium">{fetchError}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="space-y-8 relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header Section */}
      <div
        className="mb-8"
      >
        <h1 className="text-3xl font-bold font-display text-gray-900">
          Dashboard
        </h1>
        <p className="text-gray-600 text-lg">Welcome to your inventory management dashboard</p>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {[
          {
            title: "Total Products",
            value: stats ? stats.totalProducts : "-",
            icon: <Package />,
            change: {
              value: stats && stats.totalProductsChange !== undefined
                ? `${stats.totalProductsChange.toFixed(2)}%`
                : "-",
              isPositive: stats && typeof stats.totalProductsIsPositive === "boolean"
                ? stats.totalProductsIsPositive
                : true
            },
            iconBgColor: "bg-blue-100",
            iconColor: "text-blue-600"
          },
          {
            title: "Total Orders",
            value: stats ? stats.totalOrders : "-",
            icon: <ShoppingCart />,
            change: {
              value: stats && stats.totalOrdersChange !== undefined
                ? `${stats.totalOrdersChange.toFixed(2)}%`
                : "-",
              isPositive: stats && typeof stats.totalOrdersIsPositive === "boolean"
                ? stats.totalOrdersIsPositive
                : true
            },
            iconBgColor: "bg-purple-100",
            iconColor: "text-purple-600"
          },
          {
            title: "Low Stock Items",
            value: stats ? stats.lowStockCount : "-",
            icon: <AlertTriangle />,
            change: {
              value: stats && stats.lowStockChange !== undefined
                ? `${stats.lowStockChange.toFixed(2)}%`
                : "-",
              isPositive: stats && typeof stats.lowStockIsPositive === "boolean"
                ? stats.lowStockIsPositive
                : true
            },
            iconBgColor: "bg-orange-100",
            iconColor: "text-orange-600"
          },
          {
            title: "Revenue (Monthly)",
            value: stats && typeof stats.monthlyRevenue === "number"
              ? `$${stats.monthlyRevenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`
              : "-",
            icon: <DollarSign />,
            change: {
              value: stats && stats.monthlyRevenueChange !== undefined
                ? `${stats.monthlyRevenueChange.toFixed(2)}%`
                : "-",
              isPositive: stats && typeof stats.monthlyRevenueIsPositive === "boolean"
                ? stats.monthlyRevenueIsPositive
                : true
            },
            iconBgColor: "bg-green-100",
            iconColor: "text-green-600"
          }
        ].map((card, index) => (
          <div key={card.title}>
            <StatCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              change={card.change}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconColor}
            />
          </div>
        ))}
      </motion.div>

      {/* Sales Chart */}
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-soft hover-lift">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold font-display text-gray-900">Sales Overview</h2>
            <p className="text-gray-500 mt-1">Monthly sales performance trends</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <TrendingUp className="h-4 w-4" />
            <span>Last 6 months</span>
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#059669" 
                fill="url(#colorSales)" 
                fillOpacity={0.6}
                strokeWidth={3}
              />
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Orders Component */}
        <div>
          <RecentOrders />
        </div>

        {/* Low Stock Items Component */}
        <div>
          <LowStockItems />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
