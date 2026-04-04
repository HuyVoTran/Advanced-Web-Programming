import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '@/utils/constants';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Trash2, ShoppingBag, Plus, Minus, AlertCircle } from 'lucide-react';
import { EmptyState } from '../components/shared/EmptyState';
import { ConfirmDialog } from '../components/shared/ConfirmDialog';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { PageBreadcrumb } from '../components/shared/PageBreadcrumb';
import { toast } from 'sonner';
import { resolveImageSrc } from '@/utils/image';
import { productsAPI } from '@/services/api';

type StockSnapshot = {
  productId: string;
  stock: number;
  isActive: boolean;
};

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; itemId?: string }>({
    open: false,
  });
  const [confirmClear, setConfirmClear] = useState(false);
  const [stockByProductId, setStockByProductId] = useState<Record<string, StockSnapshot>>({});

  useEffect(() => {
    if (items.length === 0) {
      setStockByProductId({});
      return;
    }

    let mounted = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const fetchStocks = async () => {
      try {
        const ids = Array.from(new Set(items.map((item) => item.productId).filter(Boolean)));
        const stocks: any[] = await productsAPI.getBulkStock(ids);
        if (!mounted) return;

        const nextMap = (Array.isArray(stocks) ? stocks : []).reduce<Record<string, StockSnapshot>>((acc, stockItem: any) => {
          const productId = String(stockItem?.productId || '');
          if (!productId) return acc;
          acc[productId] = {
            productId,
            stock: Math.max(0, Number(stockItem?.stock || 0)),
            isActive: Boolean(stockItem?.isActive),
          };
          return acc;
        }, {});

        setStockByProductId(nextMap);
      } catch {
        // Ignore transient polling errors
      }
    };

    fetchStocks();
    timer = setInterval(fetchStocks, 10000);

    return () => {
      mounted = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [items]);

  const stockIssues = useMemo(() => {
    return items
      .map((item) => {
        const stockInfo = stockByProductId[item.productId];
        if (!stockInfo) return null;
        const availableStock = Number(stockInfo.stock || 0);
        const isInactive = !stockInfo.isActive;
        const isOutOfStock = availableStock <= 0 || isInactive;
        const isExceeded = !isOutOfStock && item.quantity > availableStock;

        return {
          itemId: item.id,
          productId: item.productId,
          isOutOfStock,
          isExceeded,
          availableStock,
        };
      })
      .filter(Boolean) as Array<{
        itemId: string;
        productId: string;
        isOutOfStock: boolean;
        isExceeded: boolean;
        availableStock: number;
      }>;
  }, [items, stockByProductId]);

  const hasBlockingStockIssue = stockIssues.some((issue) => issue.isOutOfStock || issue.isExceeded);

  const handleRemoveItem = (itemId: string) => {
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
      handleRemoveItem(itemId);
      return;
    }

    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;

    const stockInfo = stockByProductId[item.productId];
    const availableStock = Math.max(0, Number(stockInfo?.stock || 0));
    const isInactive = stockInfo ? !stockInfo.isActive : false;

    if (stockInfo && (isInactive || availableStock <= 0)) {
      toast.error('Sản phẩm này hiện đang hết hàng');
      return;
    }

    if (stockInfo && newQuantity > availableStock) {
      updateQuantity(itemId, availableStock);
      toast.warning(`Chỉ còn ${availableStock} sản phẩm trong kho`);
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
  const totalOriginalPrice = items.reduce((sum, item) => {
    const originalUnit = Number(item.originalPrice ?? item.price ?? 0);
    return sum + originalUnit * item.quantity;
  }, 0);
  const totalDiscount = items.reduce((sum, item) => {
    const fallbackDiscount = Math.max(0, Number(item.originalPrice ?? item.price ?? 0) - Number(item.finalPrice ?? item.price ?? 0));
    const discountUnit = Number(item.discountAmount ?? fallbackDiscount);
    return sum + discountUnit * item.quantity;
  }, 0);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <PageBreadcrumb
          className="mb-6"
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Giỏ hàng' },
          ]}
        />

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
              {items.map((item) => {
                const stockInfo = stockByProductId[item.productId];
                const availableStock = Math.max(0, Number(stockInfo?.stock ?? 0));
                const isInactive = stockInfo ? !stockInfo.isActive : false;
                const isOutOfStock = stockInfo ? availableStock <= 0 || isInactive : false;
                const isExceeded = stockInfo ? !isOutOfStock && item.quantity > availableStock : false;
                const isLowStock = stockInfo ? !isOutOfStock && availableStock <= 5 : false;
                const imageUrl = resolveImageSrc(item.image, 'products') || `https://source.unsplash.com/400x500/?${encodeURIComponent(item.name)}`;
                const originalUnitPrice = Number(item.originalPrice ?? item.price ?? 0);
                const salePercent = Number(item.salePercent ?? 0);
                const saleUnitPrice = Number(item.finalPrice ?? item.price ?? 0);
                const hasSale = salePercent > 0 || originalUnitPrice > saleUnitPrice;
                const effectiveSalePercent =
                  salePercent > 0
                    ? salePercent
                    : originalUnitPrice > 0
                      ? Math.round(((originalUnitPrice - saleUnitPrice) / originalUnitPrice) * 100)
                      : 0;
                const lineOriginalPrice = originalUnitPrice * item.quantity;
                const lineFinalPrice = saleUnitPrice * item.quantity;
                
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
                        <div className="mt-2">
                          {hasSale ? (
                            <>
                              <p className="text-sm text-muted-foreground line-through">
                                Giá gốc: {formatPrice(originalUnitPrice)}
                              </p>
                              <p className="text-sm text-red-600">Giảm: {effectiveSalePercent}%</p>
                              <p className="text-primary text-lg">Giá sau khi giảm: {formatPrice(saleUnitPrice)}</p>
                            </>
                          ) : (
                            <p className="text-primary text-lg">Giá bán: {formatPrice(saleUnitPrice)}</p>
                          )}
                        </div>
                        {stockInfo && (
                          <div className="mt-2 text-sm">
                            {isOutOfStock ? (
                              <p className="text-red-600">Sản phẩm đang hết hàng</p>
                            ) : isExceeded ? (
                              <p className="text-red-600">Vượt tồn kho, chỉ còn {availableStock} sản phẩm</p>
                            ) : isLowStock ? (
                              <p className="text-amber-600">Sắp hết hàng: còn {availableStock} sản phẩm</p>
                            ) : (
                              <p className="text-emerald-600">Còn hàng: {availableStock} sản phẩm</p>
                            )}
                          </div>
                        )}
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
                            disabled={isOutOfStock || (stockInfo ? item.quantity >= availableStock : false)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Remove Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right hidden sm:block">
                      {hasSale ? (
                        <>
                          <p className="text-sm text-muted-foreground line-through">{formatPrice(lineOriginalPrice)}</p>
                          <p className="text-lg font-light text-primary">{formatPrice(lineFinalPrice)}</p>
                        </>
                      ) : (
                        <p className="text-lg font-light">{formatPrice(lineFinalPrice)}</p>
                      )}
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
                  <span>Tạm tính (giá gốc)</span>
                  <span>{formatPrice(totalOriginalPrice)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Tổng giảm giá</span>
                  <span>-{formatPrice(totalDiscount)}</span>
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
                disabled={hasBlockingStockIssue}
              >
                Thanh toán
              </Button>

              {hasBlockingStockIssue && (
                <p className="text-sm text-red-600 mb-4">
                  Vui lòng điều chỉnh giỏ hàng theo tồn kho mới nhất trước khi thanh toán.
                </p>
              )}

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