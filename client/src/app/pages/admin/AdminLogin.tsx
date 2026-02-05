import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await loginAdmin(email, password);
    if (success) {
      toast.success('Đăng nhập thành công!');
      navigate('/admin');
    } else {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light mb-2">
            <span className="text-[#C9A24D]">BIJOUX</span> Admin
          </h1>
          <p className="text-gray-600">Đăng nhập quản trị</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#C9A24D] text-white py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded text-sm text-gray-600">
          <p className="mb-2">Demo Admin:</p>
          <p>Email: admin@example.com</p>
          <p>Mật khẩu: admin123</p>
        </div>
      </div>
    </div>
  );
};
