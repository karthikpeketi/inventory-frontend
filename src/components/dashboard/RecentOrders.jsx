import React, { useState, useEffect } from 'react';
import { ShoppingCart, Clock, User, DollarSign } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import axiosClient from '../../api/axiosClient';
import { useToast, toastUtils } from '../ui/use-toast';

const RecentOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/dashboard/recent-orders');
      setOrders(response.data);
    } catch (error) {
      toastUtils.patterns.dashboard.loadOrdersFailed(toast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    // Handle array format that comes from backend LocalDateTime
    if (Array.isArray(dateValue) && dateValue.length >= 3) {
      const d = new Date(dateValue[0], dateValue[1] - 1, dateValue[2], 
                         dateValue[3] || 0, dateValue[4] || 0, dateValue[5] || 0);
      return d.toLocaleDateString();
    }
    const d = typeof dateValue === "string" ? new Date(dateValue) : dateValue;
    return isNaN(d) ? "-" : d.toLocaleDateString();
  };

  const formatTotal = (order) => {
    if (typeof order.total === "number") {
      return `$${order.total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    }
    if (typeof order.totalAmount === "number") {
      return `$${order.totalAmount.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
    }
    return "-";
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'DELIVERED': 'success',
      'PROCESSING': 'info',
      'PENDING': 'warning',
      'CANCELLED': 'danger',
      'Delivered': 'success',
      'Processing': 'info',
      'Pending': 'warning',
      'Cancelled': 'danger',
    };
    return (
      <StatusBadge 
        status={statusMap[status] || 'info'} 
        text={status} 
      />
    );
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-soft">
        <div className="flex items-center space-x-3 mb-6">
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold font-display">Recent Orders</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div
            className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-soft hover-lift">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-2xl">
          <ShoppingCart className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900">Recent Orders</h2>
          <p className="text-sm text-gray-500">Latest customer orders</p>
        </div>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="h-8 w-8 text-gray-400" />
          </div>
          <p className="font-medium">No recent orders found</p>
          <p className="text-sm text-gray-400 mt-1">New orders will appear here</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Order ID</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Customer</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Date</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Total</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr 
                  key={order.id} 
                  className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="py-4 px-2">
                    <span className="font-mono text-sm font-medium text-gray-900">#{order.id}</span>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{order.customer}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{formatDate(order.date || order.orderDate || order.transactionDate)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="font-semibold text-gray-900">{formatTotal(order)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">{getStatusBadge(order.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentOrders;
