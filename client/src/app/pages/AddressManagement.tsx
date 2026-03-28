import React, { useEffect, useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { authAPI } from '@/services/api';
import { useAuth, type Address } from '@/contexts/AuthContext';

interface AddressFormData {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
}

const toAddressList = (rawAddresses: any[]): Address[] => {
  if (!Array.isArray(rawAddresses)) return [];

  return rawAddresses.map((addr) => ({
    id: addr?.id || addr?._id || '',
    fullName: addr?.fullName || '',
    phone: addr?.phone || '',
    address: addr?.address || '',
    city: addr?.city || '',
    district: addr?.district || '',
    ward: addr?.ward || '',
    isDefault: Boolean(addr?.isDefault),
  }));
};

export const AddressManagement: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
  });

  useEffect(() => {
    setAddresses(user?.addresses || []);
  }, [user]);

  const syncAddresses = (nextAddresses: Address[]) => {
    setAddresses(nextAddresses);
    updateUser({ addresses: nextAddresses });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        isDefault: editingId ? addresses.find((a) => a.id === editingId)?.isDefault || false : addresses.length === 0,
      };

      const response: any = editingId
        ? await authAPI.updateAddress(editingId, payload, token)
        : await authAPI.addAddress(payload, token);

      const updatedAddresses = toAddressList(response?.addresses || []);
      syncAddresses(updatedAddresses);

      toast.success(editingId ? 'Cập nhật địa chỉ thành công!' : 'Thêm địa chỉ mới thành công!');
      resetForm();
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi lưu địa chỉ');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      ward: address.ward || '',
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!token) {
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      return;
    }

    if (addresses.find((a) => a.id === id)?.isDefault && addresses.length > 1) {
      toast.error('Không thể xóa địa chỉ mặc định. Vui lòng đặt địa chỉ khác làm mặc định trước.');
      return;
    }

    try {
      const response: any = await authAPI.deleteAddress(id, token);
      const updatedAddresses = toAddressList(response?.addresses || []);
      syncAddresses(updatedAddresses);
      toast.success('Xóa địa chỉ thành công!');
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi xóa địa chỉ');
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!token) {
      toast.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
      return;
    }

    try {
      const current = addresses.find((a) => a.id === id);
      if (!current) return;

      const response: any = await authAPI.updateAddress(
        id,
        {
          fullName: current.fullName,
          phone: current.phone,
          address: current.address,
          city: current.city,
          district: current.district,
          ward: current.ward || '',
          isDefault: true,
        },
        token
      );

      const updatedAddresses = toAddressList(response?.addresses || []);
      syncAddresses(updatedAddresses);
      toast.success('Đã đặt làm địa chỉ mặc định!');
    } catch (error: any) {
      toast.error(error?.message || 'Lỗi khi đặt địa chỉ mặc định');
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      ward: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <UserDashboardLayout
      title="Sổ Địa Chỉ"
      subtitle="Quản lý địa chỉ giao hàng của bạn"
      icon={MapPin}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
      <div className="flex items-center justify-between">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl mb-6">{editingId ? 'Chỉnh Sửa Địa Chỉ' : 'Thêm Địa Chỉ Mới'}</h2>
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
                <label className="block text-sm mb-2 text-gray-700">Phường/Xã</label>
                <input
                  type="text"
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9A24D]"
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
                disabled={saving}
                className="flex-1 bg-[#C9A24D] text-white py-3 rounded-lg hover:bg-[#B8923D] transition-colors disabled:opacity-50"
              >
                {saving ? 'Đang lưu...' : editingId ? 'Cập Nhật' : 'Thêm Địa Chỉ'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
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
                {address.address}
                {address.ward ? `, ${address.ward}` : ''}
                {address.district ? `, ${address.district}` : ''}
                {address.city ? `, ${address.city}` : ''}
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
    </UserDashboardLayout>
  );
};
