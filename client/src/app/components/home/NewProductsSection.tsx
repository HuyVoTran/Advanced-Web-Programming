import React from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from '@/app/components/ProductCard';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';

interface NewProductsSectionProps {
  newProducts: any[];
  loading: boolean;
  error: string | null;
}

export const NewProductsSection: React.FC<NewProductsSectionProps> = ({ newProducts, loading, error }) => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Sản phẩm mới</h2>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            Khám phá những thiết kế mới nhất từ các thương hiệu cao cấp
          </p>
        </div>

        {error ? (
          <ErrorState message="Lỗi tải sản phẩm mới" onRetry={() => window.location.reload()} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {newProducts.length > 0 ? (
              newProducts.map((product, index) => (
                <ProductCard key={product._id || product.id} product={product} index={index} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Không có sản phẩm mới</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center">
          <Link
            to="/products"
            className="inline-block border border-gray-900 text-gray-900 px-10 py-3 text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-all duration-300"
          >
            Xem tất cả sản phẩm
          </Link>
        </div>
      </div>
    </section>
  );
};
