import React from 'react';
import { Link } from 'react-router-dom';
import { mockOrders, mockUsers, products, formatPrice, getStatusText, getStatusColor } from '@/data/mockData';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const totalRevenue = mockOrders.reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      return sum + order.total;
    }
    return sum;
  }, 0);
  const totalOrders = mockOrders.length;
  const totalProducts = products.length;
  const totalUsers = mockUsers.filter(u => u.role === 'USER').length;
  const pendingOrders = mockOrders.filter(o => o.status === 'pending').length;

  const revenueData = [
    { month: 'T9', revenue: 450000000 },
    { month: 'T10', revenue: 520000000 },
    { month: 'T11', revenue: 680000000 },
    { month: 'T12', revenue: 820000000 },
    { month: 'T1', revenue: totalRevenue * 0.4 },
    { month: 'T2', revenue: totalRevenue * 0.6 },
  ];

  const stats = [
    { name: 'Tổng doanh thu', value: formatPrice(totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { name: 'Tổng đơn hàng', value: totalOrders.toString(), icon: ShoppingCart, color: 'bg-blue-500' },
    { name: 'Sản phẩm', value: totalProducts.toString(), icon: Package, color: 'bg-purple-500' },
    { name: 'Người dùng', value: totalUsers.toString(), icon: Users, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl mb-2 tracking-wide">Dashboard</h1>
        <p className="text-gray-600">Tổng quan hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                <p className="text-2xl">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert for pending orders */}
      {pendingOrders > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
            <div>
              <h3 className="text-lg text-yellow-900 mb-1">Cần xử lý</h3>
              <p className="text-sm text-yellow-700">
                Có <strong>{pendingOrders} đơn hàng</strong> đang chờ xác nhận.{' '}
                <Link to="/admin/orders" className="underline hover:text-yellow-900">
                  Xem ngay →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl mb-6">Doanh thu 6 tháng gần nhất</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatPrice(Number(value))} />
            <Bar dataKey="revenue" fill="#C9A24D" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-[#C9A24D] hover:underline text-sm">
            Xem tất cả →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr className="text-left text-sm text-gray-600">
                <th className="pb-3">Mã đơn</th>
                <th className="pb-3">Khách hàng</th>
                <th className="pb-3">Tổng tiền</th>
                <th className="pb-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockOrders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm">{order.orderNumber}</td>
                  <td className="py-3 text-sm">{order.customerName}</td>
                  <td className="py-3 text-sm">{formatPrice(order.total)}</td>
                  <td className="py-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};