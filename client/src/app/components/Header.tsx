import React, { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ShoppingBag, User, Search } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { SearchBar } from './shared/SearchBar';
import { useProducts, useClickOutside, useNews } from '@/hooks/useCustomHooks';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { news } = useNews();

  const menuItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Danh mục', path: '/categories' },
    { name: 'Thương hiệu', path: '/brands' },
    { name: 'Tin tức', path: '/blog' },
    { name: 'Giới thiệu', path: '/about' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useClickOutside(searchRef, () => setSearchOpen(false));

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return { products: [], posts: [] };
    }

    const matchedProducts = products
      .filter((product: any) => {
        const brandName = typeof product.brand === 'object' ? product.brand?.name : product.brand;
        const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
        return (
          (product.name || '').toLowerCase().includes(query) ||
          (product.description || '').toLowerCase().includes(query) ||
          (brandName || '').toLowerCase().includes(query) ||
          (categoryName || '').toLowerCase().includes(query) ||
          (product.material || '').toLowerCase().includes(query)
        );
      })
      .slice(0, 5);

    const matchedPosts = news
      .filter((post) =>
        (post.title || '').toLowerCase().includes(query) ||
        (post.content || '').toLowerCase().includes(query)
      )
      .slice(0, 3);

    return { products: matchedProducts, posts: matchedPosts };
  }, [products, searchQuery]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-light tracking-wider">
              <span className="text-[#C9A24D]">SALVIO</span>
              <span className="text-gray-900"> ROYALE</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-sm tracking-wide text-gray-700 hover:text-[#C9A24D] transition-colors duration-300"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-6 relative">
            <div ref={searchRef} className="relative">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="text-gray-700 hover:text-[#C9A24D] transition-colors duration-300"
                aria-label="Mở tìm kiếm"
              >
                <Search className="w-5 h-5" />
              </button>

              {searchOpen && (
                <div className="absolute right-0 mt-4 w-[320px] bg-white rounded-lg shadow-xl border border-gray-100 p-4 z-50">
                  <SearchBar
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={(value) => {
                      setSearchQuery(value);
                      if (value.trim()) {
                        navigate(`/products?search=${encodeURIComponent(value.trim())}`);
                        setSearchOpen(false);
                      }
                    }}
                    placeholder="Tìm sản phẩm, tin tức..."
                    showButton
                    buttonVariant="icon"
                  />

                  {searchQuery && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Sản phẩm</p>
                        {searchResults.products.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.products.map((product: any) => (
                              <button
                                key={product._id || product.id}
                                onClick={() => {
                                  navigate(`/product/${product._id || product.id}`);
                                  setSearchOpen(false);
                                }}
                                className="w-full text-left text-sm text-gray-700 hover:text-[#C9A24D] transition-colors"
                              >
                                {product.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Không có kết quả</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase text-gray-500 tracking-wider mb-2">Tin tức</p>
                        {searchResults.posts.length > 0 ? (
                          <div className="space-y-2">
                            {searchResults.posts.map((post) => (
                              <button
                                key={post._id || post.slug || post.title}
                                onClick={() => {
                                  navigate(`/blog/${post.slug || post._id}`);
                                  setSearchOpen(false);
                                }}
                                className="w-full text-left text-sm text-gray-700 hover:text-[#C9A24D] transition-colors"
                              >
                                {post.title}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">Không có kết quả</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/cart"
              className="relative text-gray-700 hover:text-[#C9A24D] transition-colors duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C9A24D] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="relative group">
              <button className="text-gray-700 hover:text-[#C9A24D] transition-colors duration-300">
                <User className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    {user.isAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Quản trị
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Tài khoản
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Đơn hàng
                        </Link>
                      </>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button className="lg:hidden text-gray-700">
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {menuItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-base text-gray-700 hover:text-[#C9A24D] transition-colors duration-300 py-2"
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};