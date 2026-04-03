import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Heart, Share2 } from 'lucide-react';
import { calculateDiscountedPrice, formatPrice } from '@/utils/constants';
import { Product } from '../../../contexts/CartContext';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useCart } from '../../../contexts/CartContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface QuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickView: React.FC<QuickViewProps> = ({ product, isOpen, onClose }) => {
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const productId = product.id || product._id || '';
  const images = product.images || [product.image || 'jewelry'];
  const imageUrl = images[selectedImageIndex] || 'jewelry';
  const basePrice = Number(product.originalPrice || product.price || 0);
  const salePercent = Number(product.salePercent || 0);
  const finalPrice = calculateDiscountedPrice(basePrice, salePercent);

  const handleAddToCart = () => {
    addItem({
      productId: productId || '',
      name: product.name,
      price: finalPrice,
      originalPrice: basePrice,
      salePercent,
      discountAmount: Math.max(0, basePrice - finalPrice),
      finalPrice,
      image: images[0] || '',
      quantity,
    });
    toast.success('Đã thêm vào giỏ hàng', {
      description: product.name,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-light tracking-wide">Xem nhanh</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Images */}
              <div>
                <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <ImageWithFallback
                    src={`https://source.unsplash.com/800x1000/?${encodeURIComponent(imageUrl)}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.new && (
                    <Badge className="absolute top-4 left-4 bg-primary">MỚI</Badge>
                  )}
                  {product.featured && (
                    <Badge className="absolute top-4 right-4 bg-gray-900">NỔI BẬT</Badge>
                  )}
                </div>

                {/* Thumbnails */}
                {images && images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {images.slice(0, 4).map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square bg-gray-100 rounded overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          <ImageWithFallback
                            src={`https://source.unsplash.com/200x200/?${encodeURIComponent(image)}`}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      {product.brand || 'Chưa có thương hiệu'}
                    </p>
                    <h3 className="text-3xl font-light tracking-wide mb-4">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-6">
                      <span className="text-3xl text-primary">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-sm font-medium uppercase tracking-wide mb-2">
                        Mô tả
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {product.description || 'Không có mô tả'}
                      </p>
                    </div>

                    <div className="mb-6 space-y-3">
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Danh mục</span>
                        <span className="text-sm font-medium">{product.category || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Chất liệu</span>
                        <span className="text-sm font-medium">{product.material || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b">
                        <span className="text-sm text-muted-foreground">Thương hiệu</span>
                        <span className="text-sm font-medium">{product.brand || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="mb-6">
                      <Label className="text-sm font-medium uppercase tracking-wide mb-3 block">
                        Số lượng
                      </Label>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center font-medium">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-6 border-t">
                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-primary hover:bg-primary/90 text-white py-6"
                      size="lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Thêm vào giỏ hàng
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="w-full"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Yêu thích
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Chia sẻ
                      </Button>
                    </div>

                    <Link to={`/product/${product.id}`} onClick={onClose}>
                      <Button
                        variant="ghost"
                        className="w-full"
                      >
                        Xem chi tiết đầy đủ →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Label: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <label className={className}>{children}</label>
);
