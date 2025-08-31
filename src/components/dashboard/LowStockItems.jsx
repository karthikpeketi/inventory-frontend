import React, { useState, useEffect } from 'react';
import { AlertTriangle, Package, Hash, BarChart3 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { useToast, toastUtils } from '../ui/use-toast';

const LowStockItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLowStockItems = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/dashboard/low-stock');
      
      setItems(response.data.map(item => ({
        id: item.id,
        name: item.name,
        sku: item.sku || "",
        quantity: item.quantity,
        minStock: item.reorderLevel || item.minStock,
      })));
    } catch (error) {
      toastUtils.patterns.dashboard.loadStockFailed(toast);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-soft">
        <div className="flex items-center space-x-3 mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
          <h2 className="text-xl font-bold font-display">Low Stock Items</h2>
        </div>
        <div className="flex justify-center items-center h-32">
          <div
            className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-soft hover-lift">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-orange-100 rounded-2xl">
          <AlertTriangle className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-gray-900">Low Stock Items</h2>
          <p className="text-sm text-gray-500">Items requiring attention</p>
        </div>
      </div>
      
      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-blue-500" />
          </div>
          <p className="font-medium text-blue-700">All items are well stocked!</p>
          <p className="text-sm text-gray-400 mt-1">Great job managing your inventory</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Product</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">SKU</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Current</th>
                <th className="text-left py-4 px-2 font-semibold text-gray-700 text-sm">Min Stock</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr 
                  key={item.id} 
                  className="border-b border-gray-50 hover:bg-red-50/30 transition-colors"
                >
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-sm text-gray-600">{item.sku}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-red-600 font-bold">{item.quantity}</span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{item.minStock}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LowStockItems;
