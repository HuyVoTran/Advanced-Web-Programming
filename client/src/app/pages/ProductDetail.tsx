import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatPrice } from '@/utils/constants';
import { ProductCard } from '@/app/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { ShoppingBag, Heart, Share2 } from 'lucide-react';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';
import { productsAPI } from '@/services/api';
import { PageBreadcrumb } from '@/app/components/shared/PageBreadcrumb';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          setError('Sản phẩm không tìm thấy');
          return;
        }

        // Fetch product detail
        const productData = await productsAPI.getById(id);
        setProduct(productData);

        // Fetch related products
        const relatedData = await productsAPI.getRelated(id);
        setRelatedProducts(Array.isArray(relatedData) ? relatedData : relatedData.products || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải sản phẩm');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 pb-16">
        <ErrorState
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Không tìm thấy sản phẩm</h2>
          <button
            onClick={() => navigate('/products')}
            className="text-[#C9A24D] hover:underline"
          >
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const imageUrls = (product.images || []).map((img: string) => {
    if (img.startsWith('http')) {
      return img;
    }
    return `https://source.unsplash.com/800x1000/?${encodeURIComponent(img)}`;
  });

  if (imageUrls.length === 0) {
    imageUrls.push('https://source.unsplash.com/800x1000/?jewelry');
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <PageBreadcrumb
          className="mb-6"
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Sản phẩm', href: '/products' },
            { label: product.name },
          ]}
        />

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="mb-4 bg-gray-100 aspect-[3/4] rounded-sm overflow-hidden">
              <ImageWithFallback
                src={imageUrls[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            {imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {imageUrls.map((url: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-gray-100 rounded-sm overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-[#C9A24D]' : 'border-transparent'
                    }`}
                  >
                    <ImageWithFallback
                      src={url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2 tracking-wide uppercase">
                  {typeof product.brand === 'object' ? product.brand.name : product.brand}
              </p>
              <h1 className="text-4xl font-light mb-4 tracking-wide">
                {product.name}
              </h1>
              <p className="text-3xl text-[#C9A24D] mb-6">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="border-t border-b border-gray-200 py-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Danh mục</p>
                  <p className="text-base">
                    {typeof product.category === 'object'
                      ? product.category.name
                      : product.category}
                  </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Chất liệu</p>
                <p className="text-base">{product.material}</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg mb-3">Mô tả sản phẩm</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity */}
            <div>
              <p className="text-sm mb-2">Số lượng</p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#C9A24D] text-white py-4 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
              >
                Mua ngay
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full border border-gray-900 text-gray-900 py-4 text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-colors duration-300 flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Thêm vào giỏ hàng</span>
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-6 pt-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-[#C9A24D] transition-colors">
                <Heart className="w-5 h-5" />
                <span className="text-sm">Yêu thích</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-[#C9A24D] transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-3xl font-light mb-8 tracking-wide">
              Sản phẩm liên quan
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((product, index) => (
                <ProductCard
                  key={product._id || product.id}
                  product={product}
                  index={index}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
