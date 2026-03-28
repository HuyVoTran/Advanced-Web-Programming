import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Eye, AlertCircle } from 'lucide-react';
import { useAdminFetch } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface Order {
  _id: string;
  orderNumber: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
  itemCount: number;
  createdAt: string;
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const AdminOrders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch orders
  const { data: allOrders, loading, error } = useAdminFetch<Order[]>(
    () => adminApi.getAllOrders(1, 100),
    []
  );

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();

  const filteredOrders = (allOrders || []).filter(order => {
    const orderNumber = (order.orderNumber || '').toLowerCase();
    const userName = (order.user?.name || '').toLowerCase();
    const userEmail = (order.user?.email || '').toLowerCase();

    const matchesSearch =
      normalizedSearchTerm === '' ||
      orderNumber.includes(normalizedSearchTerm) ||
      userName.includes(normalizedSearchTerm) ||
      userEmail.includes(normalizedSearchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = (allOrders || []).reduce((sum, order) => {
    if (order.status !== 'cancelled') {
      return sum + order.totalPrice;
    }
    return sum;
  }, 0);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A24D]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-red-800 font-medium">Lỗi tải dữ liệu</p>
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Đơn Hàng</h1>
        <div className="flex gap-6 text-sm">
          <p className="text-gray-600">Tổng số: {(allOrders || []).length} đơn hàng</p>
          <p className="text-gray-600">Doanh thu: {formatPrice(totalRevenue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {[
          { status: 'all', label: 'Tất cả', count: (allOrders || []).length },
          { status: 'pending', label: 'Chờ xác nhận', count: (allOrders || []).filter(o => o.status === 'pending').length },
          { status: 'confirmed', label: 'Đã xác nhận', count: (allOrders || []).filter(o => o.status === 'confirmed').length },
          { status: 'shipping', label: 'Đang giao', count: (allOrders || []).filter(o => o.status === 'shipping').length },
          { status: 'completed', label: 'Hoàn thành', count: (allOrders || []).filter(o => o.status === 'completed').length },
        ].map(item => (
          <button
            key={item.status}
            onClick={() => setStatusFilter(item.status)}
            className={`bg-white rounded-lg border-2 p-4 text-left transition-colors ${
              statusFilter === item.status
                ? 'border-[#C9A24D] bg-[#C9A24D]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-2xl mb-1">{item.count}</div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, tên hoặc email khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Ngày đặt
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Sản phẩm
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{order.user?.name || 'Guest'}</div>
                      <div className="text-xs text-gray-500">{order.user?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.itemCount} sản phẩm
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      {formatPrice(order.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="inline-flex items-center gap-2 text-[#C9A24D] hover:text-[#B8923D]"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
