import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/data/mockData';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Trash2, ShoppingBag, Plus, Minus, AlertCircle } from 'lucide-react';
import { EmptyState } from '@/app/components/shared/EmptyState';
import { ConfirmDialog } from '@/app/components/shared/ConfirmDialog';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { toast } from 'sonner';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; itemId?: string }>({
    open: false,
  });
  const [confirmClear, setConfirmClear] = useState(false);

  const handleRemoveItem = (itemId: string, itemName: string) => {
    setConfirmDelete({ open: true, itemId });
  };

  const confirmRemoveItem = () => {
    if (confirmDelete.itemId) {
      const item = items.find(i => i.id === confirmDelete.itemId);
      removeFromCart(confirmDelete.itemId);
      toast.success('Đã xóa khỏi giỏ hàng', {
        description: item?.name,
      });
      setConfirmDelete({ open: false });
    }
  };

  const handleClearCart = () => {
    setConfirmClear(true);
  };

  const confirmClearCart = () => {
    clearCart();
    toast.success('Đã xóa tất cả sản phẩm');
    setConfirmClear(false);
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId, items.find(i => i.id === itemId)?.name || '');
      return;
    }
    updateQuantity(itemId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <EmptyState
            icon={ShoppingBag}
            title="Giỏ hàng trống"
            description="Bạn chưa có sản phẩm nào trong giỏ hàng. Khám phá bộ sưu tập trang sức cao cấp của chúng tôi."
            action={{
              label: 'Khám phá sản phẩm',
              onClick: () => navigate('/products'),
            }}
          />
        </div>
      </div>
    );
  }

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light mb-2 tracking-wide">Giỏ hàng</h1>
            <p className="text-muted-foreground">
              {itemCount} sản phẩm
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearCart}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa tất cả
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
                const imageUrl = `https://source.unsplash.com/400x500/?${encodeURIComponent(item.image || item.name)}`;
                
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-6 pb-6 border-b border-gray-200 last:border-b-0"
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${item.productId}`}
                      className="w-32 h-40 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0 group"
                    >
                      <ImageWithFallback
                        src={imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="text-lg font-light tracking-wide hover:text-primary transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-primary mt-2 text-lg">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-light">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right hidden sm:block">
                      <p className="text-lg font-light">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue Shopping Link */}
            <Link
              to="/products"
              className="inline-flex items-center text-primary hover:text-primary/80 transition-colors mt-6"
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-muted/30 p-8 rounded-lg sticky top-28"
            >
              <h2 className="text-2xl font-light mb-6 tracking-wide">Tổng cộng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Tạm tính</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Phí vận chuyển</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Miễn phí
                  </Badge>
                </div>
                <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                  <span className="text-xl font-light">Tổng</span>
                  <span className="text-2xl text-primary font-light">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">Miễn phí vận chuyển</p>
                    <p className="text-blue-700">
                      Áp dụng cho tất cả đơn hàng trang sức cao cấp
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-sm tracking-wider uppercase mb-3"
                size="lg"
              >
                Thanh toán
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/products')}
                className="w-full py-6 text-sm tracking-wider uppercase"
                size="lg"
              >
                Tiếp tục mua sắm
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={confirmDelete.open}
        onOpenChange={(open) => setConfirmDelete({ open, itemId: undefined })}
        title="Xóa sản phẩm"
        description="Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?"
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmRemoveItem}
        variant="destructive"
      />

      <ConfirmDialog
        open={confirmClear}
        onOpenChange={setConfirmClear}
        title="Xóa tất cả sản phẩm"
        description="Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi giỏ hàng?"
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        onConfirm={confirmClearCart}
        variant="destructive"
      />
    </div>
  );
};