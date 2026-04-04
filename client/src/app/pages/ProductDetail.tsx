import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateDiscountedPrice, formatPrice } from '@/utils/constants';
import { ProductCard } from '@/app/components/ProductCard';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { MessageSquareQuote, ShoppingBag, Heart, Share2, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';
import { productsAPI } from '@/services/api';
import { PageBreadcrumb } from '@/app/components/shared/PageBreadcrumb';
import { useProducts } from '@/hooks/useCustomHooks';
import { notify } from '@/utils/notifications';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, token, isFavorite, toggleFavorite } = useAuth();
  const { products: allProducts, loading: loadingFavoriteProducts } = useProducts();

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [stock, setStock] = useState<number | null>(null);
  const [stockLoading, setStockLoading] = useState(false);

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

        const reviewData: any = await productsAPI.getReviews(id);
        setReviews(Array.isArray(reviewData?.reviews) ? reviewData.reviews : []);

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

  useEffect(() => {
    if (!id) return;

    let mounted = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const fetchStock = async (silent = false) => {
      try {
        if (!silent) {
          setStockLoading(true);
        }
        const data: any = await productsAPI.getStock(id);
        if (!mounted) return;
        const nextStock = Math.max(0, Number(data?.stock || 0));
        setStock(nextStock);
      } catch {
        if (!mounted) return;
        setStock(null);
      } finally {
        if (!silent && mounted) {
          setStockLoading(false);
        }
      }
    };

    fetchStock();
    timer = setInterval(() => {
      fetchStock(true);
    }, 10000);

    return () => {
      mounted = false;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [id]);

  useEffect(() => {
    if (stock === null) return;
    if (stock <= 0) {
      setQuantity(1);
      return;
    }
    if (quantity > stock) {
      setQuantity(stock);
      toast.warning('Số lượng đã được điều chỉnh theo tồn kho mới nhất');
    }
  }, [stock, quantity]);

  // All derived values that depend on `product` — must be computed unconditionally
  // before any early returns to satisfy the Rules of Hooks.
  const imageUrls = useMemo(() => {
    if (!product) return ['https://source.unsplash.com/800x1000/?jewelry'];
    const urls = (product.images || []).map((img: string) => {
      if (!img) return img;
      if (img.startsWith('http')) return img;
      if (img.startsWith('/client/public/')) return img.replace('/client/public', '');
      if (img.startsWith('/')) return img;
      return `/images/products/${img}`;
    });
    return urls.length > 0 ? urls : ['https://source.unsplash.com/800x1000/?jewelry'];
  }, [product]);

  const materialLabel = useMemo(() => {
    if (!product) return '';
    return typeof product.material === 'string' && product.material.length > 0
      ? `${product.material.charAt(0).toUpperCase()}${product.material.slice(1)}`
      : product.material;
  }, [product]);

  const basePrice = Number(product?.originalPrice || product?.price || 0);
  const salePercent = Number(product?.salePercent || 0);
  const hasSale = salePercent > 0;
  const salePrice = calculateDiscountedPrice(basePrice, salePercent);

  const favoriteProducts = useMemo(() => {
    if (!product) return [];
    const favoriteIds = user?.favoriteProductIds || [];
    const currentProductId = String(product._id || product.id || '');
    return allProducts
      .filter((item: any) => favoriteIds.includes(String(item._id || item.id)))
      .filter((item: any) => String(item._id || item.id) !== currentProductId)
      .slice(0, 4);
  }, [allProducts, product, user?.favoriteProductIds]);

  const currentProductId = product ? String(product._id || product.id || '') : '';
  const favorite = currentProductId ? isFavorite(currentProductId) : false;
  const availableStock = stock ?? Math.max(0, Number(product?.stock || 0));
  const isOutOfStock = availableStock <= 0;
  const isLowStock = !isOutOfStock && availableStock <= 5;

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
    if (isOutOfStock) {
      toast.error('Sản phẩm hiện đã hết hàng');
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
      return;
    }
    addToCart(product, quantity);
    toast.success('Đã thêm vào giỏ hàng');
  };

  const handleBuyNow = () => {
    if (isOutOfStock) {
      toast.error('Sản phẩm hiện đã hết hàng');
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Chỉ còn ${availableStock} sản phẩm trong kho`);
      return;
    }
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleToggleFavorite = async () => {
    const productId = String(product?._id || product?.id || '');

    if (!productId) {
      return;
    }

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

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Đã sao chép link sản phẩm');
    } catch {
      toast.error('Không thể sao chép link');
    }
  };

  const handleSubmitReview = async () => {
    const trimmedContent = reviewContent.trim();

    if (!user || !token) {
      notify.info('Vui lòng đăng nhập để gửi đánh giá');
      navigate('/login');
      return;
    }

    if (trimmedContent.length < 10) {
      notify.error('Đánh giá cần tối thiểu 10 ký tự');
      return;
    }

    if (!id) {
      return;
    }

    try {
      setSubmittingReview(true);
      const nextReview: any = await productsAPI.createReview(id, trimmedContent, token);
      setReviews((prev) => {
        const review = nextReview?.data ?? nextReview;
        const filtered = prev.filter((item) => String(item.user?._id || item.user?.id) !== String(user.id));
        return [review, ...filtered];
      });
      setReviewContent('');
      notify.success('Đánh giá của bạn đã được lưu');
    } catch (error) {
      notify.error('Không thể gửi đánh giá', error instanceof Error ? error.message : undefined);
    } finally {
      setSubmittingReview(false);
    }
  };

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
              <div className="mb-6">
                {hasSale && (
                  <p className="text-lg text-gray-500 line-through mb-1">{formatPrice(basePrice)}</p>
                )}
                <p className={`text-3xl ${hasSale ? 'text-red-600' : 'text-[#C9A24D]'}`}>
                  {formatPrice(salePrice)}
                </p>
                {hasSale && <p className="text-sm text-red-600 mt-1">Sale {salePercent}%</p>}
              </div>
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
                <p className="text-base">{materialLabel}</p>
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
              <div className="mb-3">
                {stockLoading ? (
                  <p className="text-xs text-muted-foreground">Đang cập nhật tồn kho...</p>
                ) : isOutOfStock ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Hết hàng
                  </p>
                ) : isLowStock ? (
                  <p className="text-sm text-amber-600">Chỉ còn {availableStock} sản phẩm</p>
                ) : (
                  <p className="text-sm text-emerald-600">Còn hàng: {availableStock} sản phẩm</p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={isOutOfStock}
                >
                  -
                </button>
                <span className="text-lg w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(quantity + 1, Math.max(1, availableStock)))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  disabled={isOutOfStock || quantity >= availableStock}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleBuyNow}
                className="w-full bg-[#C9A24D] text-white py-4 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300 disabled:opacity-60"
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full border border-gray-900 text-gray-900 py-4 text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-colors duration-300 flex items-center justify-center space-x-2 disabled:opacity-60"
                disabled={isOutOfStock}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}</span>
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex items-center space-x-6 pt-4">
              <button
                onClick={handleToggleFavorite}
                className={`flex items-center space-x-2 transition-colors ${
                  favorite ? 'text-rose-500 hover:text-rose-600' : 'text-gray-600 hover:text-[#C9A24D]'
                }`}
              >
                <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} />
                <span className="text-sm">Yêu thích</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 hover:text-[#C9A24D] transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Chia sẻ</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mb-24 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-5">
              <MessageSquareQuote className="w-5 h-5 text-[#C9A24D]" />
              <div>
                <h2 className="text-2xl font-light tracking-wide">Đánh giá thật từ khách hàng</h2>
                <p className="text-sm text-gray-500">Chỉ khách đã mua và hoàn thành đơn mới có thể đánh giá.</p>
              </div>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên chia sẻ trải nghiệm.
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review._id} className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div>
                        <p className="text-sm text-gray-900">{review.user?.fullName || 'Khách hàng đã xác thực'}</p>
                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs uppercase tracking-wide text-emerald-700">
                          Verified purchase
                        </span>
                      )}
                    </div>
                    <p className="text-sm leading-6 text-gray-600">{review.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 h-fit">
            <div>
              <h3 className="text-xl font-light tracking-wide">Viết đánh giá</h3>
              <p className="text-sm text-gray-500 mt-1">Chia sẻ cảm nhận thực tế để giúp khách hàng khác mua sắm tự tin hơn.</p>
            </div>

            <textarea
              value={reviewContent}
              onChange={(event) => setReviewContent(event.target.value)}
              rows={7}
              maxLength={1200}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#C9A24D]"
              placeholder="Ví dụ: Thiết kế sang trọng, đóng gói chỉn chu, đeo lên rất tôn da..."
            />
            <p className="text-xs text-gray-400 text-right">{reviewContent.length}/1200</p>

            <button
              type="button"
              onClick={handleSubmitReview}
              disabled={submittingReview || reviewContent.trim().length < 10}
              className="w-full bg-[#C9A24D] text-white py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300 disabled:opacity-50"
            >
              {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-24">
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

        {!loadingFavoriteProducts && (
          <div>
            <h2 className="text-3xl font-light mb-8 tracking-wide">
              Sản phẩm yêu thích
            </h2>

            {favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {favoriteProducts.map((favoriteProduct, index) => (
                  <ProductCard
                    key={favoriteProduct._id || favoriteProduct.id}
                    product={favoriteProduct}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
                <Heart className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                <p className="text-lg text-gray-800 mb-2">Chưa có sản phẩm yêu thích phù hợp</p>
                <p className="text-sm text-gray-600 mb-5">
                  Hãy nhấn vào biểu tượng trái tim để lưu sản phẩm bạn quan tâm và xem lại nhanh hơn.
                </p>
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center justify-center border border-gray-900 px-5 py-2 text-sm tracking-wide uppercase text-gray-900 transition-colors duration-300 hover:bg-gray-900 hover:text-white"
                >
                  Khám phá sản phẩm
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
