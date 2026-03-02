import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '../../contexts/CartContext';
import { toast } from 'sonner';
import { formatPrice } from '@/utils/constants';

interface ProductCardProps {
  product: any;
  index?: number;
  viewMode?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0, viewMode = 'grid' }) => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    // Lấy hình ảnh từ product
    const images = product.images || product.image || [];
    const firstImage = Array.isArray(images) ? images[0] : images;
    
    if (firstImage && typeof firstImage === 'string') {
      // Nếu là URL thực, sử dụng trực tiếp
      if (firstImage.startsWith('http')) {
        setImageUrl(firstImage);
      } else {
        // Nếu là tên, tạo URL Unsplash
        setImageUrl(`https://source.unsplash.com/600x800/?${encodeURIComponent(firstImage)}`);
      }
    } else {
      // Fallback
      setImageUrl(`https://source.unsplash.com/600x800/?jewelry`);
    }
  }, [product.images, product.image]);

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

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      quantity: 1,
    });
    toast.success('Đã thêm vào giỏ hàng', {
      description: product.name,
    });
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        className="group"
      >
        <Link to={`/product/${product.id}`} className="flex gap-6 bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {/* Image */}
          <div className="relative w-48 h-48 flex-shrink-0 bg-gray-100">
            <ImageWithFallback
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
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
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 py-4 pr-4 flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">{product.brand}</p>
              <h3 className="text-lg font-light tracking-wide mb-2">{product.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
              <p className="text-sm text-muted-foreground">{product.material}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xl text-primary">{formatPrice(product.price)}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAddToCart}
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
    );
  }

  // Grid view (default)
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden bg-gray-100 aspect-[3/4] rounded-sm">
          {/* Product Image */}
          <ImageWithFallback
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

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
          </div>

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-6">
            <h3 className="text-xl mb-2 text-center">{product.name}</h3>
            <p className="text-sm text-white/80 mb-1">{product.category.name}</p>
            <p className="text-lg text-[#C9A24D] font-light tracking-wide mb-4">
              {formatPrice(product.price)}
            </p>
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="bg-primary hover:bg-primary/90 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Thêm vào giỏ
            </Button>
          </div>
        </div>

        {/* Product Info (shown below image on desktop) */}
        <div className="mt-4 space-y-1">
          <p className="text-xs text-gray-500 tracking-wide uppercase">{product.brand.name}</p>
          <h3 className="text-sm text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="text-base text-[#C9A24D]">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  );
};