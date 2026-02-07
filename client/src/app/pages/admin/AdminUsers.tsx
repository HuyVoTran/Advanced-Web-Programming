import React, { useState } from 'react';
import { Search, User, Shield, Mail, Phone } from 'lucide-react';
import { mockUsers } from '../../../data/mockData';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';

export const AdminUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleToggleRole = (_userId: string, currentRole: string) => {
    const newRole = currentRole === 'USER' ? 'ADMIN' : 'USER';
    if (window.confirm(`Bạn có chắc chắn muốn thay đổi quyền thành ${newRole}?`)) {
      toast.success('Cập nhật quyền người dùng thành công!');
    }
  };

  const userCount = mockUsers.filter(u => u.role === 'USER').length;
  const adminCount = mockUsers.filter(u => u.role === 'ADMIN').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Người Dùng</h1>
        <div className="flex gap-6 text-sm">
          <p className="text-gray-600">Tổng số: {mockUsers.length} người dùng</p>
          <p className="text-gray-600">User: {userCount}</p>
          <p className="text-gray-600">Admin: {adminCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { role: 'all', label: 'Tất cả', count: mockUsers.length, icon: User },
          { role: 'USER', label: 'Người dùng', count: userCount, icon: User },
          { role: 'ADMIN', label: 'Quản trị viên', count: adminCount, icon: Shield },
        ].map(item => (
          <button
            key={item.role}
            onClick={() => setRoleFilter(item.role)}
            className={`bg-white rounded-lg border-2 p-6 text-left transition-colors ${
              roleFilter === item.role
                ? 'border-[#C9A24D] bg-[#C9A24D]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                roleFilter === item.role ? 'bg-[#C9A24D]' : 'bg-gray-100'
              }`}>
                <item.icon className={`w-6 h-6 ${roleFilter === item.role ? 'text-white' : 'text-gray-600'}`} />
              </div>
              <div className="text-2xl">{item.count}</div>
            </div>
            <div className="text-sm text-gray-600">{item.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
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
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Địa chỉ
                </th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-700">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C9A24D]/10 rounded-full flex items-center justify-center">
                          {user.role === 'ADMIN' ? (
                            <Shield className="w-5 h-5 text-[#C9A24D]" />
                          ) : (
                            <User className="w-5 h-5 text-[#C9A24D]" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm">{user.fullName}</div>
                          <div className="text-xs text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.addresses.length > 0 ? (
                        <span>{user.addresses.length} địa chỉ</span>
                      ) : (
                        <span className="text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'ADMIN' ? (
                          <>
                            <Shield className="w-3 h-3" />
                            Quản trị viên
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Người dùng
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleRole(user.id, user.role)}
                        className="text-sm text-[#C9A24D] hover:underline"
                      >
                        Đổi quyền
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy người dùng nào
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
