import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light mb-6 tracking-wide">Liên hệ với chúng tôi</h1>
          <p className="text-xl text-gray-600 font-light">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-light mb-8">Gửi tin nhắn</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-2"
                />
              </div>

              <div>
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

              <div>
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="message">Nội dung *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="mt-2"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#C9A24D] text-white py-4 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
              >
                Gửi tin nhắn
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-light mb-8">Thông tin liên hệ</h2>
            
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg mb-2">Địa chỉ showroom</h3>
                  <p className="text-gray-600">123 Đường Lê Lợi, Quận 1</p>
                  <p className="text-gray-600">Thành phố Hồ Chí Minh, Việt Nam</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg mb-2">Điện thoại</h3>
                  <p className="text-gray-600">Hotline: 1900 1234</p>
                  <p className="text-gray-600">Mobile: 0901 234 567</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg mb-2">Email</h3>
                  <p className="text-gray-600">info@bijouxroyale.vn</p>
                  <p className="text-gray-600">support@bijouxroyale.vn</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#C9A24D] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg mb-2">Giờ làm việc</h3>
                  <p className="text-gray-600">Thứ 2 - Thứ 7: 9:00 - 21:00</p>
                  <p className="text-gray-600">Chủ nhật: 10:00 - 20:00</p>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="mt-8 bg-gray-100 h-64 rounded-lg flex items-center justify-center">
              <p className="text-gray-400">Google Maps</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
