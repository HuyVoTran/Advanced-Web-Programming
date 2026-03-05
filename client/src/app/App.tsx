import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
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
import { NotFound } from '@/app/pages/NotFound';
import { Login } from '@/app/pages/Login';
import { Register } from '@/app/pages/Register';
import { ForgotPassword } from '@/app/pages/ForgotPassword';
import { ResetPassword } from '@/app/pages/ResetPassword';
import { UserAccount } from '@/app/pages/UserAccount';
import { UserDashboard } from '@/app/pages/UserDashboard';
import { UserProfile } from '@/app/pages/UserProfile';
import { AddressManagement } from '@/app/pages/AddressManagement';
import { UserSettings } from '@/app/pages/UserSettings';
import { OrderHistory } from '@/app/pages/OrderHistory';
import { About } from '@/app/pages/About';
import { Contact } from '@/app/pages/Contact';
import { Categories } from '@/app/pages/Categories';
import { Blog } from '@/app/pages/Blog';
import { LegalTerms } from '@/app/pages/LegalTerms';
import { LegalPrivacy } from '@/app/pages/LegalPrivacy';
import { LegalReturn } from '@/app/pages/LegalReturn';
import { LegalShipping } from '@/app/pages/LegalShipping';
import { Brands } from '@/app/pages/Brands';

// Admin
import { AdminLayout } from '@/app/pages/admin/AdminLayout';
import { AdminDashboard } from '@/app/pages/admin/AdminDashboard';
import { AdminProducts } from '@/app/pages/admin/AdminProducts';
import { AdminProductForm } from '@/app/pages/admin/AdminProductForm';
import { AdminCategories } from '@/app/pages/admin/AdminCategories';
import { AdminOrders } from '@/app/pages/admin/AdminOrders';
import { AdminOrderDetail } from '@/app/pages/admin/AdminOrderDetail';
import { AdminUsers } from '@/app/pages/admin/AdminUsers';
import { AdminNews } from '@/app/pages/admin/AdminNews';
import { AdminNewsletter } from '@/app/pages/admin/AdminNewsletter';
import { AdminContacts } from '@/app/pages/admin/AdminContacts';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isAdminRoute = location.pathname.startsWith('/admin');

  React.useEffect(() => {
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [location.pathname, navigationType]);
  
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
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/account" element={<UserAccount />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/addresses" element={<AddressManagement />} />
                <Route path="/settings" element={<UserSettings />} />
                <Route path="/orders" element={<OrderHistory />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Simple Pages */}
                <Route path="/categories" element={<Categories />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/legal/terms" element={<LegalTerms />} />
                <Route path="/legal/privacy" element={<LegalPrivacy />} />
                <Route path="/legal/return" element={<LegalReturn />} />
                <Route path="/legal/shipping" element={<LegalShipping />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/new" element={<AdminProductForm />} />
                  <Route path="products/:id" element={<AdminProductForm />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="orders/:id" element={<AdminOrderDetail />} />
                  <Route path="news" element={<AdminNews />} />
                  <Route path="newsletter" element={<AdminNewsletter />} />
                  <Route path="contacts" element={<AdminContacts />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<NotFound />} />
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