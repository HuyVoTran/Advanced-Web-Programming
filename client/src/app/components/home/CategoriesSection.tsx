import React from 'react';
import { CategoryCard } from '@/app/components/CategoryCard';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';

interface CategoriesSectionProps {
  categories: any[];
  loading: boolean;
  error: string | null;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ categories, loading, error }) => {
  const displayCategories = categories
    .filter((category) => {
      const normalizedName = String(category?.name || '').trim().toLowerCase();
      const normalizedSlug = String(category?.slug || '').trim().toLowerCase();
      return normalizedName !== 'sale' && normalizedSlug !== 'sale';
    })
    .slice(0, 4);

  return (
    <section className="py-24 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">Danh mục sản phẩm</h2>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">Khám phá bộ sưu tập đa dạng của chúng tôi</p>
        </div>

        {error ? (
          <ErrorState message="Lỗi tải danh mục" onRetry={() => window.location.reload()} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {displayCategories.length > 0 ? (
              displayCategories.map((category) => (
                <CategoryCard key={category._id || category.id} category={category} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Không có danh mục nào</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
