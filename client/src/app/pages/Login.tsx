import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { toast } from 'sonner';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loggedUser = await login(email, password);
    if (loggedUser) {
      toast.success('Đăng nhập thành công!');
      // If the logged in user is admin, redirect to admin dashboard
      if (loggedUser.isAdmin) {
        navigate('/admin');
        return;
      }

      // If the route was /admin/login but a non-admin logs in, redirect to home
      if (location.pathname.startsWith('/admin')) {
        navigate('/');
        return;
      }

      navigate('/');
    } else {
      toast.error('Email hoặc mật khẩu không đúng');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-light mb-2 text-center tracking-wide">Đăng nhập</h1>
          <p className="text-gray-600 text-center mb-8">
            Chào mừng quay trở lại
          </p>

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
                placeholder="your@email.com"
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
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#C9A24D] text-white py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
            >
              Đăng nhập
            </button>

            <div className="text-center mt-4">
              <Link to="/forgot-password" className="text-sm text-[#C9A24D] hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#C9A24D] hover:underline">
              Đăng ký ngay
            </Link>
          </p>

          {/* Demo credentials removed */}
        </div>
      </div>
    </div>
  );
};