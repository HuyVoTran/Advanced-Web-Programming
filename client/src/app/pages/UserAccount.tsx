import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Trash2, Plus } from 'lucide-react';

export const UserAccount: React.FC = () => {
  const { user, updateUser, addAddress, deleteAddress } = useAuth();
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    isDefault: false,
  });

  const [showAddressForm, setShowAddressForm] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(profileData);
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    addAddress(newAddress);
    toast.success('Thêm địa chỉ thành công!');
    setShowAddressForm(false);
    setNewAddress({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      district: '',
      ward: '',
      isDefault: false,
    });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl font-light mb-12 tracking-wide">Tài khoản của tôi</h1>

        <Tabs defaultValue="profile" className="max-w-4xl">
          <TabsList>
            <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="addresses">Địa chỉ giao hàng</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-2xl">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="mt-2"
                />
              </div>

              <button
                type="submit"
                className="bg-[#C9A24D] text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
              >
                Cập nhật
              </button>
            </form>
          </TabsContent>

          <TabsContent value="addresses" className="mt-6">
            <div className="space-y-6">
              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center space-x-2 text-[#C9A24D] hover:underline"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm địa chỉ mới</span>
              </button>

              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="border border-gray-200 p-6 rounded-lg space-y-4">
                  <h3 className="text-lg mb-4">Thêm địa chỉ mới</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Họ và tên</Label>
                      <Input
                        value={newAddress.fullName}
                        onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Số điện thoại</Label>
                      <Input
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Địa chỉ</Label>
                      <Input
                        value={newAddress.address}
                        onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Phường/Xã</Label>
                      <Input
                        value={newAddress.ward}
                        onChange={(e) => setNewAddress({ ...newAddress, ward: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Quận/Huyện</Label>
                      <Input
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Tỉnh/Thành phố</Label>
                      <Input
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#C9A24D] text-white px-6 py-2 text-sm hover:bg-[#b8923f] transition-colors"
                  >
                    Lưu địa chỉ
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.addresses.map((address) => (
                  <div key={address.id} className="border border-gray-200 p-6 rounded-lg relative">
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 bg-[#C9A24D] text-white text-xs px-2 py-1">
                        Mặc định
                      </span>
                    )}
                    <p className="font-medium mb-2">{address.fullName}</p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {address.address}, {address.ward}, {address.district}, {address.city}
                    </p>
                    <button
                      onClick={() => {
                        deleteAddress(address.id);
                        toast.success('Đã xóa địa chỉ');
                      }}
                      className="mt-4 text-red-500 hover:text-red-700 text-sm flex items-center space-x-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Xóa</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
