import React, { useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { LayoutDashboard, Package, ShoppingCart, Users, List, LogOut, Newspaper, Mail, MessageSquare } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/404', { replace: true });
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) {
    return null;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Danh mục', path: '/admin/categories', icon: List },
    { name: 'Sản phẩm', path: '/admin/products', icon: Package },
    { name: 'Tin tức', path: '/admin/news', icon: Newspaper },
    { name: 'Thông báo', path: '/admin/newsletter', icon: Mail },
    { name: 'Liên hệ', path: '/admin/contacts', icon: MessageSquare },
    { name: 'Đơn hàng', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Người dùng', path: '/admin/users', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-light">
              <span className="text-[#C9A24D]">Salvio</span> Admin
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-[#C9A24D] transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-[#C9A24D] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
