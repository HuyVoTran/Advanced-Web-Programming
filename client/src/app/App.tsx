import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { Toaster } from '@/app/components/ui/sonner';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

// Pages
import { Home } from '@/app/pages/Home';
import { Products } from '@/app/pages/Products';
import { ProductDetail } from '@/app/pages/ProductDetail';
import { Cart } from '@/app/pages/Cart';
import { CheckoutNew as Checkout } from '@/app/pages/CheckoutNew';
import { OrderSuccess } from '@/app/pages/OrderSuccess';
import { Login } from '@/app/pages/Login';
import { Register } from '@/app/pages/Register';
import { ForgotPassword } from '@/app/pages/ForgotPassword';
import { UserAccount } from '@/app/pages/UserAccount';
import { UserDashboard } from '@/app/pages/UserDashboard';
import { UserProfile } from '@/app/pages/UserProfile';
import { AddressManagement } from '@/app/pages/AddressManagement';
import { UserSettings } from '@/app/pages/UserSettings';
import { OrderHistory } from '@/app/pages/OrderHistory';
import { About } from '@/app/pages/About';
import { Contact } from '@/app/pages/Contact';

// Admin
import { AdminLogin } from '@/app/pages/admin/AdminLogin';
import { AdminLayout } from '@/app/pages/admin/AdminLayout';
import { AdminDashboard } from '@/app/pages/admin/AdminDashboard';
import { AdminProducts } from '@/app/pages/admin/AdminProducts';
import { AdminProductForm } from '@/app/pages/admin/AdminProductForm';
import { AdminCategories } from '@/app/pages/admin/AdminCategories';
import { AdminOrders } from '@/app/pages/admin/AdminOrders';
import { AdminOrderDetail } from '@/app/pages/admin/AdminOrderDetail';
import { AdminUsers } from '@/app/pages/admin/AdminUsers';

// Simple Pages Component
const SimplePage: React.FC<{ title: string; description: string }> = ({ title, description }) => (
  <div className="min-h-screen bg-white pt-24 pb-16">
    <div className="container mx-auto px-4 lg:px-8">
      <h1 className="text-4xl font-light mb-4 tracking-wide">{title}</h1>
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success/:orderId" element={<OrderSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/account" element={<UserAccount />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/addresses" element={<AddressManagement />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Simple Pages */}
                <Route path="/categories" element={<SimplePage title="Danh mục" description="Khám phá các danh mục sản phẩm" />} />
                <Route path="/brands" element={<SimplePage title="Thương hiệu" description="Các thương hiệu cao cấp" />} />
                <Route path="/blog" element={<SimplePage title="Tin tức" description="Cập nhật tin tức mới nhất" />} />
                <Route path="/legal/terms" element={<SimplePage title="Điều khoản sử dụng" description="Điều khoản và điều kiện" />} />
                <Route path="/legal/privacy" element={<SimplePage title="Chính sách bảo mật" description="Chính sách bảo mật thông tin" />} />
                <Route path="/legal/return" element={<SimplePage title="Chính sách đổi trả" description="Hướng dẫn đổi trả hàng" />} />
                <Route path="/legal/shipping" element={<SimplePage title="Chính sách giao hàng" description="Thông tin giao hàng" />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/:id" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
              </Routes>
            </Layout>
            <Toaster />
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;