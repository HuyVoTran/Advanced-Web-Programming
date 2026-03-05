import React, { useMemo, useState } from 'react';
import { AlertCircle, Eye, Mail, MessageSquare, Phone, Search, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useAdminFetch, useAdminMutation } from '@/hooks/useCustomHooks';
import { adminApi } from '@/services/adminApi';
import { toast } from 'sonner';

interface ContactItem {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

const statusLabel: Record<ContactItem['status'], string> = {
  new: 'Mới',
  read: 'Đã đọc',
  replied: 'Đã phản hồi',
};

const statusClasses: Record<ContactItem['status'], string> = {
  new: 'bg-[#C9A24D]/10 text-[#8A6B2C]',
  read: 'bg-blue-50 text-blue-700',
  replied: 'bg-green-50 text-green-700',
};

const truncateText = (value: string, maxLength: number) => {
  if (!value) return '';
  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
};

export const AdminContacts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactItem['status']>('all');
  const [selectedContact, setSelectedContact] = useState<ContactItem | null>(null);

  const { data: allContacts = [], loading, error, refetch } = useAdminFetch<ContactItem[]>(
    () => adminApi.getContacts(1, 200),
    []
  );

  const { mutate: viewContact, loading: viewingLoading } = useAdminMutation<ContactItem>(
    (id) => adminApi.getContactById(id)
  );

  const { mutate: removeContact, loading: deletingLoading } = useAdminMutation<any>(
    (id) => adminApi.deleteContact(id)
  );

  const filteredContacts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return (allContacts || []).filter((contact) => {
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter;
      if (!term) return matchesStatus;
      const matchText =
        contact.fullName.toLowerCase().includes(term) ||
        contact.email.toLowerCase().includes(term) ||
        contact.phone.includes(searchTerm) ||
        contact.message.toLowerCase().includes(term);
      return matchesStatus && matchText;
    });
  }, [allContacts, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    const base = { all: 0, new: 0, read: 0, replied: 0 } as Record<string, number>;
    (allContacts || []).forEach((contact) => {
      base.all += 1;
      base[contact.status] = (base[contact.status] || 0) + 1;
    });
    return base;
  }, [allContacts]);

  const handleView = async (id: string) => {
    try {
      const contact = await viewContact(id);
      if (contact) {
        setSelectedContact(contact);
        refetch();
      }
    } catch (err) {
      toast.error('Không thể tải chi tiết liên hệ');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa liên hệ của ${name}?`)) {
      return;
    }
    try {
      await removeContact(id);
      toast.success('Đã xóa liên hệ');
      if (selectedContact?._id === id) {
        setSelectedContact(null);
      }
      refetch();
    } catch (err) {
      toast.error('Xóa liên hệ thất bại');
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
        <h1 className="text-3xl mb-2 tracking-wide">Quản Lý Liên Hệ</h1>
        <div className="flex gap-6 text-sm">
          <p className="text-gray-600">Tổng số: {counts.all}</p>
          <p className="text-gray-600">Mới: {counts.new}</p>
          <p className="text-gray-600">Đã đọc: {counts.read}</p>
          <p className="text-gray-600">Đã phản hồi: {counts.replied}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: 'all', label: 'Tất cả', count: counts.all },
          { key: 'new', label: 'Mới', count: counts.new },
          { key: 'read', label: 'Đã đọc', count: counts.read },
          { key: 'replied', label: 'Đã phản hồi', count: counts.replied },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key as 'all' | ContactItem['status'])}
            className={`bg-white rounded-lg border-2 p-4 text-left transition-colors ${
              statusFilter === item.key
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
            placeholder="Tìm theo tên, email, số điện thoại hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
          />
        </div>
      </div>

      {selectedContact && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl mb-1">{selectedContact.fullName}</h2>
              <p className="text-sm text-gray-500">
                {format(new Date(selectedContact.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${statusClasses[selectedContact.status]}`}>
              {statusLabel[selectedContact.status]}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail className="w-4 h-4" />
              {selectedContact.email}
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              {selectedContact.phone}
            </div>
          </div>
          <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-line">
            {selectedContact.message}
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">Người gửi</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">Liên hệ</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">Nội dung</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs uppercase tracking-wider text-gray-700">Ngày gửi</th>
                <th className="px-6 py-4 text-center text-xs uppercase tracking-wider text-gray-700">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#C9A24D]/10 rounded-full flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-[#C9A24D]" />
                        </div>
                        <div>
                          <div className="text-sm">{contact.fullName}</div>
                          <div className="text-xs text-gray-500">ID: {contact._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {contact.email}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {contact.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {truncateText(contact.message, 80)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${statusClasses[contact.status]}`}>
                        {statusLabel[contact.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {format(new Date(contact.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-3">
                        <button
                          onClick={() => handleView(contact._id)}
                          disabled={viewingLoading}
                          className="text-[#C9A24D] hover:text-[#B8923D]"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact._id, contact.fullName)}
                          disabled={deletingLoading}
                          className="text-red-500 hover:text-red-600"
                          title="Xóa"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy liên hệ nào
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
