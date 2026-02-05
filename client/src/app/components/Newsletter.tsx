import React, { useState } from 'react';
import { Input } from '@/app/components/ui/input';
import { toast } from 'sonner';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Đăng ký nhận tin thành công!');
      setEmail('');
    }
  };

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-4 tracking-wide">
            Đăng ký nhận tin
          </h2>
          <p className="text-gray-600 mb-8 font-light">
            Nhận thông tin về bộ sưu tập mới và ưu đãi đặc biệt
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3 border-gray-300 focus:border-[#C9A24D] focus:ring-[#C9A24D]"
            />
            <button
              type="submit"
              className="bg-[#C9A24D] text-white px-8 py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
