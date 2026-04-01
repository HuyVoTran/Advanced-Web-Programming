import React from 'react';
import { ProductCard } from '@/app/components/ProductCard';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';

interface FeaturedProductsSectionProps {
  featuredProducts: any[];
  loading: boolean;
  error: string | null;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ featuredProducts, loading, error }) => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Sản phẩm nổi bật</h2>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">Những món trang sức được yêu thích nhất</p>
        </div>

        {error ? (
          <ErrorState message="Lỗi tải sản phẩm nổi bật" onRetry={() => window.location.reload()} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.slice(0, 3).map((product, index) => (
                <ProductCard key={product._id || product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Không có sản phẩm nổi bật</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
