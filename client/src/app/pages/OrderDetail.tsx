import React from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { formatPrice, getStatusColor, getStatusText } from '@/utils/constants';
import { ArrowLeft, Package } from 'lucide-react';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { notify } from '@/utils/notifications';
import { productsAPI } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog';
import { Textarea } from '@/app/components/ui/textarea';
import { Button } from '@/app/components/ui/button';

type StockSnapshot = {
  productId: string;
  stock: number;
  hasSizes?: boolean;
  sizeStocks?: Array<{ size: string; quantity: number }>;
  isActive: boolean;
};

const normalizeSizeKey = (value?: string) => String(value || '').trim().toLowerCase();

export const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrderById, updateOrderStatus } = useOrders();
  const [cancelling, setCancelling] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState('');
  const [stockByProductId, setStockByProductId] = React.useState<Record<string, StockSnapshot>>({});
  const hasAutoOpenedCancelDialog = React.useRef(false);

  const order = id ? getOrderById(id) : undefined;
  const totalOriginalPrice = order
    ? Number(
        order.totalOriginalPrice ??
          order.items.reduce((sum, item) => sum + Number(item.originalPrice ?? item.price ?? 0) * item.quantity, 0)
      )
    : 0;
  const totalDiscount = order
    ? Number(
        order.totalDiscount ??
          order.items.reduce((sum, item) => {
            const fallbackDiscount = Math.max(0, Number(item.originalPrice ?? item.price ?? 0) - Number(item.finalPrice ?? item.price ?? 0));
            return sum + Number(item.discountAmount ?? fallbackDiscount) * item.quantity;
          }, 0)
      )
    : 0;

  // Guest vẫn có thể xem order detail từ email link
  // Không cần redirect /login

  React.useEffect(() => {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      setStockByProductId({});
      return;
    }

    let mounted = true;

    const fetchStocks = async () => {
      try {
        const productIds = Array.from(new Set(order.items.map((item) => String(item.productId || '')).filter(Boolean)));
        const stocks: any[] = await productsAPI.getBulkStock(productIds);
        if (!mounted) return;

        const nextMap = (Array.isArray(stocks) ? stocks : []).reduce<Record<string, StockSnapshot>>((acc, stockItem: any) => {
          const productId = String(stockItem?.productId || '');
          if (!productId) return acc;

          acc[productId] = {
            productId,
            stock: Math.max(0, Number(stockItem?.stock || 0)),
            hasSizes: Boolean(stockItem?.hasSizes),
            sizeStocks: Array.isArray(stockItem?.sizeStocks)
              ? stockItem.sizeStocks.map((entry: any) => ({
                  size: String(entry?.size || '').trim(),
                  quantity: Math.max(0, Number(entry?.quantity || 0)),
                }))
              : [],
            isActive: Boolean(stockItem?.isActive),
          };

          return acc;
        }, {});

        setStockByProductId(nextMap);
      } catch {
        // ignore stock polling errors in order detail
      }
    };

    fetchStocks();
    const timer = window.setInterval(fetchStocks, 15000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-xl mb-2">Không tìm thấy đơn hàng</p>
              <p className="text-gray-600 mb-6">Đơn hàng có thể chưa được tải hoặc không tồn tại.</p>
              <Link
                to="/"
                className="inline-block bg-[#C9A24D] text-white px-6 py-3 rounded hover:bg-[#b8923f] transition-colors"
              >
                Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const canCancelOrder = ['pending', 'confirmed'].includes(order.status);
  const showCancelButton = user && canCancelOrder;
  const shouldOpenCancelFromQuery = ['1', 'true', 'yes'].includes(
    String(searchParams.get('cancel') || '').toLowerCase()
  );

  React.useEffect(() => {
    if (hasAutoOpenedCancelDialog.current) {
      return;
    }

    if (order && canCancelOrder && shouldOpenCancelFromQuery) {
      setCancelDialogOpen(true);
      hasAutoOpenedCancelDialog.current = true;
    }
  }, [order, canCancelOrder, shouldOpenCancelFromQuery]);

  const handleCancelOrder = async () => {
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      notify.error('Vui lòng nhập lý do hủy đơn');
      return;
    }

    try {
      setCancelling(true);
      await updateOrderStatus(order.id, 'cancelled', { cancelReason: trimmedReason });
      notify.orderCancelled(order.id);
      setCancelDialogOpen(false);
      setCancelReason('');
    } catch (error) {
      notify.error('Không thể hủy đơn hàng', 'Vui lòng thử lại sau.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" />
              Quay lại trang chủ
            </Link>
            <h1 className="text-4xl font-light tracking-wide">Chi tiết đơn hàng</h1>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="text-lg font-medium">{order.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm w-fit ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                {showCancelButton && (
                  <button
                    type="button"
                    onClick={() => setCancelDialogOpen(true)}
                    disabled={cancelling}
                    className="px-4 py-2 rounded text-sm border border-red-300 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? 'Đang hủy...' : 'Hủy đơn'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl mb-4">Sản phẩm</h2>
            {order.items.map((item, index) => {
              const originalUnitPrice = Number(item.originalPrice ?? item.price ?? 0);
              const finalUnitPrice = Number(item.finalPrice ?? item.price ?? 0);
              const salePercent = Number(item.salePercent || 0);
              const hasSale = salePercent > 0 && originalUnitPrice > finalUnitPrice;
              const selectedSize = String((item as any).size || '').trim();
              const stockInfo = stockByProductId[String(item.productId || '')];
              const sizeQuantity = selectedSize
                ? (stockInfo?.sizeStocks || []).find(
                    (entry) => normalizeSizeKey(entry?.size) === normalizeSizeKey(selectedSize)
                  )?.quantity
                : undefined;
              const showSizeStock = Boolean(selectedSize) && Boolean(stockInfo?.hasSizes);
              const currentSizeStock = showSizeStock ? Math.max(0, Number(sizeQuantity || 0)) : null;
              const isSizeOutOfStock = showSizeStock && (currentSizeStock === 0 || !stockInfo?.isActive);

              return (
                <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p>{item.productName}</p>
                      {selectedSize && <p className="text-sm text-gray-500">Size: {selectedSize}</p>}
                      <p className="text-sm text-gray-500">SL: {item.quantity}</p>
                      {showSizeStock && (
                        <p className={`text-sm ${isSizeOutOfStock ? 'text-red-600' : 'text-emerald-600'}`}>
                          {isSizeOutOfStock ? 'Hiện tại: size đã hết hàng' : `Hiện tại: còn ${currentSizeStock} sản phẩm cho size này`}
                        </p>
                      )}
                      {hasSale && (
                        <p className="text-sm text-gray-500">Giá gốc: {formatPrice(originalUnitPrice)}</p>
                      )}
                      {hasSale && (
                        <p className="text-sm text-red-600">Giảm giá: {salePercent}%</p>
                      )}
                      {hasSale && (
                        <p className="text-sm text-[#C9A24D]">Giá sau khi giảm: {formatPrice(finalUnitPrice)}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {hasSale && (
                      <p className="text-sm text-gray-500 line-through">
                        {formatPrice(originalUnitPrice * item.quantity)}
                      </p>
                    )}
                    <p>{formatPrice(finalUnitPrice * item.quantity)}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính (giá gốc)</span>
              <span>{formatPrice(totalOriginalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-green-600">
              <span>Tổng giảm giá</span>
              <span>-{formatPrice(totalDiscount)}</span>
            </div>
            {order.couponCode && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Mã giảm giá ({order.couponCode})</span>
                <span>-{formatPrice(order.couponDiscount ?? 0)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Tổng cộng</span>
              <span className="text-lg text-[#C9A24D]">{formatPrice(order.total)}</span>
            </div>
            {order.status === 'completed' && (order as any).loyaltyPointsAwarded > 0 && (
              <div className="flex justify-between text-sm text-amber-600 mt-1">
                <span>🏅 Điểm tích lũy</span>
                <span>+{(order as any).loyaltyPointsAwarded} điểm</span>
              </div>
            )}
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl mb-4">Thông tin giao hàng</h2>
          <div className="text-gray-700 space-y-1">
            <p>{order.shippingAddress.fullName || order.guestInfo?.name}</p>
            <p>{order.shippingAddress.phone || order.guestInfo?.phone}</p>
            <p>
              {order.shippingAddress.address || ''}
              {order.shippingAddress.ward ? `, ${order.shippingAddress.ward}` : ''}
              {order.shippingAddress.district ? `, ${order.shippingAddress.district}` : ''}
              {order.shippingAddress.city ? `, ${order.shippingAddress.city}` : ''}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Phương thức thanh toán</p>
            <p>{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod || 'N/A'}</p>
          </div>

          {order.status === 'completed' && (order as any).loyaltyPointsAwarded > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Điểm tích lũy từ đơn hàng này</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-medium">
                  +{(order as any).loyaltyPointsAwarded} điểm
                </span>
                <span className="text-xs text-gray-500">
                  Hạng {(order as any).loyaltyRankApplied || 'member'} · x{(order as any).loyaltyMultiplierApplied || 1} lần
                </span>
              </div>
            </div>
          )}
          {order.status === 'cancelled' && order.cancelReason && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">Lý do hủy đơn</p>
              <p className="text-gray-700 whitespace-pre-wrap">{order.cancelReason}</p>
            </div>
          )}
        </div>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hủy đơn hàng</DialogTitle>
              <DialogDescription>
                Vui lòng nhập lý do hủy đơn hàng trước khi xác nhận.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <label htmlFor="cancel-reason-detail" className="text-sm text-gray-700">
                Lý do hủy <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="cancel-reason-detail"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ví dụ: Tôi đặt nhầm sản phẩm..."
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-gray-500 text-right">{cancelReason.length}/500</p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCancelDialogOpen(false);
                  setCancelReason('');
                }}
              >
                Đóng
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelling}
              >
                {cancelling ? 'Đang hủy...' : 'Xác nhận hủy đơn'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
