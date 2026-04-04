import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import { calculateDiscountedPrice, formatPrice } from '@/utils/constants';
import { getPrimaryProductImage } from '@/utils/image';
import { useAuth } from '@/contexts/AuthContext';
import { notify } from '@/utils/notifications';

interface ProductCardProps {
  product: any;
  index?: number;
  viewMode?: 'grid' | 'list';
  enableQuickQuantityPopup?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  viewMode = 'grid',
  enableQuickQuantityPopup = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [sizeDialogOpen, setSizeDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { user, isFavorite, toggleFavorite } = useAuth();
  const navigate = useNavigate();

  const productId = product._id || product.id;
  const imageUrl = getPrimaryProductImage(product) || 'https://source.unsplash.com/600x800/?jewelry';
  const favorite = isFavorite(productId);
  const categoryName = typeof product.category === 'object' ? product.category?.name : product.category;
  const basePrice = Number(product.originalPrice || product.price || 0);
  const salePercent = Number(product.salePercent || 0);
  const hasSale = salePercent > 0;
  const salePrice = calculateDiscountedPrice(basePrice, salePercent);
  const normalizedSizeStocks = Array.isArray(product?.sizeStocks)
    ? product.sizeStocks
        .map((entry: any) => ({
          size: String(entry?.size || '').trim(),
          quantity: Math.max(0, Number(entry?.quantity || 0)),
        }))
        .filter((entry: { size: string; quantity: number }) => entry.size.length > 0)
    : [];
  const hasSizeOptions = Boolean(product?.hasSizes) && normalizedSizeStocks.length > 0;
  const totalStock = hasSizeOptions
    ? normalizedSizeStocks.reduce((sum: number, entry: { size: string; quantity: number }) => sum + Math.max(0, Number(entry.quantity || 0)), 0)
    : Math.max(0, Number(product?.stock || 0));
  const isSoldOut = totalStock <= 0;

  const selectedSizeStock = normalizedSizeStocks.find((entry: { size: string; quantity: number }) => entry.size === selectedSize);
  const availableStockForSelection = hasSizeOptions
    ? Math.max(0, Number(selectedSizeStock?.quantity || 0))
    : Math.max(0, Number(product?.stock || 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const addCurrentSelectionToCart = (quantity = 1, size = '') => {
    const normalizedSize = String(size || '').trim();
    addItem({
      productId,
      size: normalizedSize,
      name: product.name,
      price: salePrice,
      originalPrice: basePrice,
      salePercent,
      discountAmount: Math.max(0, basePrice - salePrice),
      finalPrice: salePrice,
      image: imageUrl,
      quantity,
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (isSoldOut) {
      toast.error('Sản phẩm hiện đã hết hàng');
      return;
    }

    if (hasSizeOptions || enableQuickQuantityPopup) {
      const firstAvailableSize = normalizedSizeStocks.find((entry: { size: string; quantity: number }) => entry.quantity > 0);

      if (hasSizeOptions && !firstAvailableSize) {
        toast.error('Sản phẩm hiện đã hết hàng');
        return;
      }

      if (hasSizeOptions) {
        setSelectedSize((prev) => prev || firstAvailableSize?.size || '');
      } else {
        setSelectedSize('');
      }
      setSelectedQuantity(1);
      setSizeDialogOpen(true);
      return;
    }

    addCurrentSelectionToCart(1, '');
    toast.success('Đã thêm vào giỏ hàng', {
      description: product.name,
    });
  };

  const handleConfirmAddToCart = () => {
    if (hasSizeOptions && !selectedSize) {
      toast.error('Vui lòng chọn size');
      return;
    }

    if (availableStockForSelection <= 0) {
      toast.error('Size đã chọn hiện đã hết hàng');
      return;
    }

    const safeQuantity = Math.max(1, Math.min(selectedQuantity, availableStockForSelection));
    addCurrentSelectionToCart(safeQuantity, selectedSize);
    toast.success('Đã thêm vào giỏ hàng', {
      description: hasSizeOptions
        ? `${product.name} - Size ${selectedSize}`
        : `${product.name} - SL ${safeQuantity}`,
    });
    setSizeDialogOpen(false);
  };

  const handleConfirmBuyNow = () => {
    if (hasSizeOptions && !selectedSize) {
      toast.error('Vui lòng chọn size');
      return;
    }

    if (availableStockForSelection <= 0) {
      toast.error('Size đã chọn hiện đã hết hàng');
      return;
    }

    const safeQuantity = Math.max(1, Math.min(selectedQuantity, availableStockForSelection));
    addCurrentSelectionToCart(safeQuantity, selectedSize);
    setSizeDialogOpen(false);
    navigate('/cart');
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      notify.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích');
      navigate('/login');
      return;
    }

    try {
      const added = await toggleFavorite(productId);
      if (added) {
        notify.wishlistAdded(product.name);
      } else {
        notify.wishlistRemoved(product.name);
      }
    } catch (error) {
      notify.error(
        'Không thể cập nhật danh sách yêu thích',
        error instanceof Error ? error.message : undefined
      );
    }
  };

  if (viewMode === 'list') {
    return (
      <>
        <motion.div
          ref={cardRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="group"
        >
          <Link to={`/product/${product._id || product.id}`} className="flex gap-6 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Image */}
          <div className="relative w-48 h-48 flex-shrink-0 bg-gray-100">
            <ImageWithFallback
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-20">
                <span className="px-3 py-1.5 rounded border border-white/70 text-white text-xs tracking-[0.16em] uppercase">Sold Out!</span>
              </div>
            )}
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
              {product.new && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 tracking-wider">
                  MỚI
                </span>
              )}
              {product.featured && (
                <span className="bg-gray-900 text-white text-xs px-2 py-0.5 tracking-wider">
                  NỔI BẬT
                </span>
              )}
              {hasSale && (
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 tracking-wider">
                  Sale {salePercent}%
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`absolute top-2 right-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
                favorite
                  ? 'border-rose-200 bg-white text-rose-500'
                  : 'border-white/60 bg-white/90 text-gray-600 hover:text-rose-500'
              }`}
              aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">{typeof product.brand === 'object' ? product.brand.name : product.brand}</p>
              <h3 className="text-lg font-light tracking-wide mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
              <p className="text-sm text-muted-foreground">{product.material}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex flex-col">
                {hasSale && (
                  <span className="text-sm text-gray-500 line-through">{formatPrice(basePrice)}</span>
                )}
                <p className={`text-xl ${hasSale ? 'text-red-600' : 'text-primary'}`}>{formatPrice(salePrice)}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          </div>
          </Link>
        </motion.div>
        <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{hasSizeOptions ? 'Chọn size trước khi mua' : 'Chọn số lượng'}</DialogTitle>
              <DialogDescription>
                {hasSizeOptions ? product.name : `Sản phẩm: ${product.name}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {hasSizeOptions && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">Size</p>
                  <div className="flex flex-wrap gap-2">
                    {normalizedSizeStocks.map((entry: { size: string; quantity: number }) => {
                      const isOutOfStock = entry.quantity <= 0;
                      const isSelected = selectedSize === entry.size;
                      return (
                        <button
                          key={entry.size}
                          type="button"
                          onClick={() => {
                            setSelectedSize(entry.size);
                            setSelectedQuantity(1);
                          }}
                          disabled={isOutOfStock}
                          className={`px-3 py-2 rounded border text-sm transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-gray-300 text-gray-700 hover:border-primary/60'
                          } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {entry.size} {isOutOfStock ? '(Hết hàng)' : `(Còn ${entry.quantity})`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-700 mb-2">Số lượng</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-9 h-9 border border-gray-300 rounded"
                    disabled={availableStockForSelection <= 0}
                  >
                    -
                  </button>
                  <span className="w-10 text-center">{selectedQuantity}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedQuantity((prev) => Math.min(prev + 1, Math.max(1, availableStockForSelection)))
                    }
                    className="w-9 h-9 border border-gray-300 rounded"
                    disabled={availableStockForSelection <= 0 || selectedQuantity >= availableStockForSelection}
                  >
                    +
                  </button>
                  <span className="text-xs text-muted-foreground">Tối đa: {availableStockForSelection}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSizeDialogOpen(false)}>
                Đóng
              </Button>
              <Button type="button" variant="outline" onClick={handleConfirmAddToCart}>
                Thêm vào giỏ
              </Button>
              <Button type="button" onClick={handleConfirmBuyNow}>
                Mua ngay
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Grid view (default)
  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Link to={`/product/${product._id || product.id}`} className="group block">
        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] rounded-sm">
          {/* Product Image */}
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/55 flex items-center justify-center z-20">
              <span className="px-4 py-2 rounded border border-white/70 text-white text-sm tracking-[0.18em] uppercase">Sold Out!</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
            {product.new && (
              <span className="bg-[#C9A24D] text-white text-xs px-3 py-1 tracking-wider">
                MỚI
              </span>
            )}
            {product.featured && (
              <span className="bg-gray-900 text-white text-xs px-3 py-1 tracking-wider">
                NỔI BẬT
              </span>
            )}
            {hasSale && (
              <span className="bg-red-600 text-white text-xs px-3 py-1 tracking-wider">
                Sale {salePercent}%
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleToggleFavorite}
            className={`absolute top-4 right-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-sm transition-colors ${
              favorite
                ? 'border-rose-200 bg-white text-rose-500'
                : 'border-white/60 bg-white/85 text-gray-700 hover:text-rose-500'
            }`}
            aria-label={favorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
          >
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          </button>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-6">
            <h3 className="text-xl mb-2 text-center line-clamp-2">{product.name}</h3>
            <p className="text-sm text-white/80 mb-1">{categoryName}</p>
            <div className="mb-4 text-center">
              {hasSale && (
                <p className="text-sm text-white/70 line-through">{formatPrice(basePrice)}</p>
              )}
              <p className={`text-lg font-light tracking-wide ${hasSale ? 'text-red-400' : 'text-[#C9A24D]'}`}>
                {formatPrice(salePrice)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className="bg-primary hover:bg-primary/90 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Thêm vào giỏ
            </Button>
          </div>
        </div>

        {/* Product Info (shown below image on desktop) */}
        <div className="mt-4 space-y-1">
          <p className="text-xs text-gray-500 tracking-wide uppercase truncate">{typeof product.brand === 'object' ? product.brand.name : product.brand}</p>
          <h3 className="text-sm text-gray-900 line-clamp-1">{product.name}</h3>
          <div className="space-y-0.5">
            {hasSale && (
              <p className="text-xs text-gray-500 line-through">{formatPrice(basePrice)}</p>
            )}
            <p className={`text-base ${hasSale ? 'text-red-600' : 'text-[#C9A24D]'}`}>{formatPrice(salePrice)}</p>
          </div>
        </div>
        </Link>
      </motion.div>
      <Dialog open={sizeDialogOpen} onOpenChange={setSizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{hasSizeOptions ? 'Chọn size trước khi mua' : 'Chọn số lượng'}</DialogTitle>
            <DialogDescription>
              {hasSizeOptions ? product.name : `Sản phẩm: ${product.name}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {hasSizeOptions && (
              <div>
                <p className="text-sm text-gray-700 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {normalizedSizeStocks.map((entry: { size: string; quantity: number }) => {
                    const isOutOfStock = entry.quantity <= 0;
                    const isSelected = selectedSize === entry.size;
                    return (
                      <button
                        key={entry.size}
                        type="button"
                        onClick={() => {
                          setSelectedSize(entry.size);
                          setSelectedQuantity(1);
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-2 rounded border text-sm transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-300 text-gray-700 hover:border-primary/60'
                        } ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {entry.size} {isOutOfStock ? '(Hết hàng)' : `(Còn ${entry.quantity})`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-gray-700 mb-2">Số lượng</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-9 h-9 border border-gray-300 rounded"
                  disabled={availableStockForSelection <= 0}
                >
                  -
                </button>
                <span className="w-10 text-center">{selectedQuantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedQuantity((prev) => Math.min(prev + 1, Math.max(1, availableStockForSelection)))
                  }
                  className="w-9 h-9 border border-gray-300 rounded"
                  disabled={availableStockForSelection <= 0 || selectedQuantity >= availableStockForSelection}
                >
                  +
                </button>
                <span className="text-xs text-muted-foreground">Tối đa: {availableStockForSelection}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSizeDialogOpen(false)}>
              Đóng
            </Button>
            <Button type="button" variant="outline" onClick={handleConfirmAddToCart}>
              Thêm vào giỏ
            </Button>
            <Button type="button" onClick={handleConfirmBuyNow}>
              Mua ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};