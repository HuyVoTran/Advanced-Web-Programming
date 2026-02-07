import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { formatPrice } from '../../data/mockData';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { addOrder } = useOrders();

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.addresses[0]?.address || '',
    city: user?.addresses[0]?.city || '',
    district: user?.addresses[0]?.district || '',
    ward: user?.addresses[0]?.ward || '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const orderId = addOrder({
      userId: user?.id || 'guest',
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total,
      status: 'pending',
      shippingAddress: {
        id: '1',
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        district: formData.district,
        ward: formData.ward,
        isDefault: false,
      },
      guestInfo: !user ? {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      } : undefined,
    });

    clearCart();
    toast.success('Đặt hàng thành công!');
    navigate(`/order-success/${orderId}`);
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-4xl font-light mb-12 tracking-wide">Thanh toán</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-2xl font-light mb-6">Thông tin giao hàng</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fullName">Họ và tên *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="address">Địa chỉ *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ward">Phường/Xã *</Label>
                    <Input
                      id="ward"
                      name="ward"
                      value={formData.ward}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="district">Quận/Huyện *</Label>
                    <Input
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="city">Tỉnh/Thành phố *</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Ghi chú đơn hàng</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-8 rounded-sm sticky top-28">
                <h2 className="text-2xl font-light mb-6">Đơn hàng của bạn</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const imageUrl = `https://source.unsplash.com/200x250/?${encodeURIComponent(item.image)}`;
                    return (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-20 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm line-clamp-2">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-gray-300 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span>Miễn phí</span>
                  </div>
                  <div className="flex justify-between text-xl pt-3 border-t border-gray-300">
                    <span>Tổng cộng</span>
                    <span className="text-[#C9A24D]">{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#C9A24D] text-white py-4 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
                >
                  Đặt hàng
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
