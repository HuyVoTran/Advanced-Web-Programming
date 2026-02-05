import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Address } from '@/data/mockData';

const mockAddresses: Address[] = [
  {
    id: 'addr1',
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '123 Nguyễn Huệ',
    city: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    isDefault: true,
  },
  {
    id: 'addr2',
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    address: '456 Lê Lợi',
    city: 'Hà Nội',
    district: 'Quận Hoàn Kiếm',
    isDefault: false,
  },
];

export const AddressManagement: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Address, 'id' | 'isDefault'>>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setAddresses(addresses.map(addr =>
        addr.id === editingId ? { ...formData, id: editingId, isDefault: addr.isDefault } : addr
      ));
      toast.success('Cập nhật địa chỉ thành công!');
    } else {
      const newAddress: Address = {
        ...formData,
        id: `addr${Date.now()}`,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
      toast.success('Thêm địa chỉ mới thành công!');
    }
    resetForm();
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (addresses.find(a => a.id === id)?.isDefault && addresses.length > 1) {
      toast.error('Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.');
      return;
    }
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Xóa địa chỉ thành công!');
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success('Đã đặt làm địa chỉ mặc định!');
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      district: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl tracking-wide">Sổ Địa Chỉ</h1>
              <p className="text-gray-600">Quản lý địa chỉ giao hàng của bạn</p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-[#C9A24D] text-white px-6 py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Thêm Địa Chỉ Mới
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-xl mb-6">
              {editingId ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm mb-2 text-gray-700">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    placeholder="Số nhà, tên đường"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm mb-2 text-gray-700">
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="submit"
                  className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
                >
                  {editingId ? 'Cập Nhật' : 'Thêm Địa Chỉ'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg shadow-sm border-2 p-6 relative ${
                address.isDefault ? 'border-[#C9A24D]' : 'border-gray-200'
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 bg-[#C9A24D] text-white text-xs px-3 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Mặc định
                  </span>
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-lg mb-2">{address.fullName}</h3>
                <p className="text-gray-600 text-sm mb-1">{address.phone}</p>
                <p className="text-gray-600 text-sm">
                  {address.address}, {address.district}, {address.city}
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-2 text-[#C9A24D] hover:underline text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                {!address.isDefault && (
                  <>
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                    >
                      <Check className="w-4 h-4" />
                      Đặt mặc định
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="flex items-center gap-2 text-red-600 hover:underline text-sm ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      Xóa
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {addresses.length === 0 && !showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ nào</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#C9A24D] text-white px-6 py-3 rounded-lg hover:bg-[#B8923D] transition-colors"
            >
              Thêm Địa Chỉ Đầu Tiên
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
