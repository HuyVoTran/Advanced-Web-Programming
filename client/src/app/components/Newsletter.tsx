import React, { useState } from 'react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { API_CONFIG } from '@/config/api';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập địa chỉ email.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đã có lỗi xảy ra khi đăng ký.');
      }

      toast.success('Đăng ký nhận tin thành công!');
      setEmail('');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Đã có lỗi xảy ra.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-muted/30 py-20">
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
              disabled={loading}
              required
              className="flex-1 py-3"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {loading ? 'Đang gửi...' : 'Đăng ký'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};
