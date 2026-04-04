import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Menu, ShoppingBag, User, Search, ChevronDown, X } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { SearchBar } from './shared/SearchBar';
import { useProducts, useClickOutside, useNews, useCategories, useDebounce } from '@/hooks/useCustomHooks';
import { AnimatePresence, motion } from 'motion/react';
import { isPromoHeaderDismissed, PROMOTION_RESET_EVENT, setPromoHeaderDismissed } from '@/utils/constants';
import { notificationsAPI, productsAPI } from '@/services/api';

const NOTIFICATIONS_UPDATED_EVENT = 'notifications-updated';

const PROMOTION_ITEMS = [
  {
    to: '/products?sale=1',
    label: 'Giảm giá lên đến 50% - Mua ngay',
  },
  {
    to: '/products',
    label: 'Miễn phí ship toàn bộ sản phẩm',
  },
];
export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileCatsOpen, setMobileCatsOpen] = useState(false);
  const [promotionIndex, setPromotionIndex] = useState(0);
  const [isPromotionVisible, setIsPromotionVisible] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null!);
  const { itemCount } = useCart();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { news } = useNews();
  const { categories } = useCategories();
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const menuItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản phẩm', path: '/products' },
    { name: 'Danh mục', path: '/categories' },
    { name: 'Tin tức', path: '/blog' },
    { name: 'Thương hiệu', path: '/about' },
    { name: 'Liên hệ', path: '/contact' },
  ];

  const iconButtonClass =
    'relative flex h-10 w-10 items-center justify-center rounded-full text-gray-700 hover:text-[#C9A24D] hover:bg-gray-100 transition-colors duration-300';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useClickOutside(searchRef, () => setSearchOpen(false));

  useEffect(() => {
    const syncPromotionVisibility = () => {
      const isDismissed = isPromoHeaderDismissed();
      setIsPromotionVisible(!isDismissed);
    };

    const handlePromoReset = () => {
      setPromotionIndex(0);
      setIsPromotionVisible(true);
    };

    syncPromotionVisibility();
    window.addEventListener(PROMOTION_RESET_EVENT, handlePromoReset as EventListener);

    return () => {
      window.removeEventListener(PROMOTION_RESET_EVENT, handlePromoReset as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!isPromotionVisible) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setPromotionIndex((prev) => (prev + 1) % PROMOTION_ITEMS.length);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isPromotionVisible]);

  const handleDismissPromotion = () => {
    setIsPromotionVisible(false);
    setPromoHeaderDismissed(true);
  };

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

  const displayedProducts = suggestedProducts.length > 0 ? suggestedProducts : searchResults.products;

  useEffect(() => {
    const query = debouncedSearchQuery.trim();

    if (query.length < 2) {
      setSuggestedProducts([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        const data = await productsAPI.getSearchSuggestions(query);
        setSuggestedProducts(Array.isArray(data) ? data : []);
      } catch {
        setSuggestedProducts([]);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  useEffect(() => {
    if (!token) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        const data: any = await notificationsAPI.getUnreadCount(token);
        setUnreadCount(Number(data?.unreadCount || 0));
      } catch {
        setUnreadCount(0);
      }
    };

    loadUnreadCount();
    window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);

    return () => {
      window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, loadUnreadCount);
    };
  }, [token]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      {isPromotionVisible && (
        <div className="bg-[#111827] text-white">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="h-7 grid grid-cols-[24px_1fr_24px] items-center text-[10px] sm:text-xs tracking-wide">
              <div className="w-6" aria-hidden="true" />

              <div className="overflow-hidden text-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={promotionIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    className="text-center"
                  >
                    <Link
                      to={PROMOTION_ITEMS[promotionIndex].to}
                      className="hover:text-[#F6D365] transition-colors duration-300"
                    >
                      {PROMOTION_ITEMS[promotionIndex].label}
                    </Link>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                type="button"
                onClick={handleDismissPromotion}
                className="justify-self-end p-1 text-white/70 hover:text-white transition-colors"
                aria-label="Tắt thông báo khuyến mãi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/images/SalvioRoyale-Logo.png"
              alt="Salvio Royale"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden lg:flex items-center space-x-8">
            {menuItems.map((item) =>
              item.path === '/categories' ? (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className="flex items-center gap-1 text-sm tracking-wide text-gray-700 hover:text-[#C9A24D] transition-colors duration-300"
                  >
                    {item.name}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  {/* Categories Dropdown */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <Link
                      to="/categories"
                      className="block px-4 py-2 text-sm text-[#C9A24D] font-medium hover:bg-gray-50 border-b border-gray-100 mb-1"
                    >
                      Tất cả danh mục
                    </Link>
                    {categories.map((cat: any) => (
                      <Link
                        key={cat._id || cat.id}
                        to={`/products?category=${cat._id || cat.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A24D] transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className="text-sm tracking-wide text-gray-700 hover:text-[#C9A24D] transition-colors duration-300"
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-2 relative">
            <div ref={searchRef} className="relative flex items-center">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className={iconButtonClass}
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
                        {displayedProducts.length > 0 ? (
                          <div className="space-y-2">
                            {displayedProducts.map((product: any) => (
                              <button
                                key={product._id || product.id}
                                onClick={() => {
                                  navigate(`/product/${product.slug || product._id || product.id}`);
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
              className={iconButtonClass}
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-[#C9A24D] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {user && (
              <Link to="/notifications" className={iconButtonClass} aria-label="Thông báo">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-[#C9A24D] text-white text-[10px] min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            <div className="relative group flex items-center">
              <button className={iconButtonClass}>
                <User className="w-5 h-5" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2">
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
                        <Link
                          to="/chat"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Chat hỗ trợ
                        </Link>
                        <Link
                          to="/returns"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Trả hàng
                        </Link>
                        <Link
                          to="/notifications"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Thông báo
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
                  {menuItems.map((item) =>
                    item.path === '/categories' ? (
                      <div key={item.path}>
                        <button
                          onClick={() => setMobileCatsOpen((v) => !v)}
                          className="flex items-center justify-between w-full text-base text-gray-700 hover:text-[#C9A24D] transition-colors duration-300 py-2"
                        >
                          {item.name}
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileCatsOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {mobileCatsOpen && (
                          <div className="pl-4 flex flex-col space-y-2 mt-1">
                            <Link
                              to="/categories"
                              onClick={() => setMobileMenuOpen(false)}
                              className="text-sm text-[#C9A24D] font-medium py-1"
                            >
                              Tất cả danh mục
                            </Link>
                            {categories.map((cat: any) => (
                              <Link
                                key={cat._id || cat.id}
                                to={`/products?category=${cat._id || cat.id}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-sm text-gray-600 hover:text-[#C9A24D] transition-colors py-1"
                              >
                                {cat.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-base text-gray-700 hover:text-[#C9A24D] transition-colors duration-300 py-2"
                      >
                        {item.name}
                      </Link>
                    )
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};