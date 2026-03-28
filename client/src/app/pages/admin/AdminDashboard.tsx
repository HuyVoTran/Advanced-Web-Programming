import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminFetch } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardData {
  stats: {
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    totalBrands: number;
    totalCategories: number;
    totalRevenue: number;
  };
  recentOrders: any[];
  orderStats: any[];
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const AdminDashboard: React.FC = () => {
  const { data: dashboardData, loading, error } = useAdminFetch<DashboardData>(
    () => adminApi.getDashboard(),
    []
  );

  const orderStatusConfig: Record<string, { label: string }> = {
    pending: { label: 'Chờ xác nhận' },
    confirmed: { label: 'Đã xác nhận' },
    shipping: { label: 'Đang giao' },
    completed: { label: 'Hoàn thành' },
    cancelled: { label: 'Đã hủy' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A24D]"></div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
          <p className="text-red-600 text-sm">{error || 'Không thể tải dữ liệu dashboard'}</p>
        </div>
      </div>
    );
  }

  const stats = [
    { name: 'Tổng doanh thu', value: formatPrice(dashboardData.stats.totalRevenue), icon: DollarSign, color: 'bg-green-500' },
    { name: 'Tổng đơn hàng', value: dashboardData.stats.totalOrders.toString(), icon: ShoppingCart, color: 'bg-blue-500' },
    { name: 'Sản phẩm', value: dashboardData.stats.totalProducts.toString(), icon: Package, color: 'bg-purple-500' },
    { name: 'Người dùng', value: dashboardData.stats.totalUsers.toString(), icon: Users, color: 'bg-orange-500' },
  ];

  const orderStatsChartData = Object.entries(orderStatusConfig).map(([status, config]) => {
    const stat = (dashboardData.orderStats || []).find((item: any) => item?._id === status);
    return {
      status,
      label: config.label,
      count: Number(stat?.count || 0),
      total: Number(stat?.total || 0),
    };
  });

  const pendingOrders = orderStatsChartData.find((item) => item.status === 'pending')?.count || 0;

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
                <p className="text-2xl font-semibold">{stat.value}</p>
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
        <h2 className="text-xl mb-6">Thống kê số lượng đơn hàng theo trạng thái</h2>
        {orderStatsChartData.some((item) => item.count > 0) ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderStatsChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => [Number(value), 'Số đơn']} />
              <Bar dataKey="count" fill="#C9A24D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có dữ liệu đơn hàng</p>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl">Đơn hàng gần đây</h2>
          <Link to="/admin/orders" className="text-[#C9A24D] hover:underline text-sm">
            Xem tất cả →
          </Link>
        </div>
        {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
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
              {dashboardData.recentOrders.slice(0, 5).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="py-3 text-sm">{order._id}</td>
                  <td className="py-3 text-sm">{order.user?.name || 'N/A'}</td>
                  <td className="py-3 text-sm">{formatPrice(order.totalPrice)}</td>
                  <td className="py-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipping' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Chưa có đơn hàng</p>
        )}
      </div>
    </div>
  );
};