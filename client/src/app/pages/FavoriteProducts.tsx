import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { UserDashboardLayout } from '@/app/components/shared/UserDashboardLayout';
import { ProductCard } from '@/app/components/ProductCard';
import { EmptyState } from '@/app/components/shared/EmptyState';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/useCustomHooks';

export const FavoriteProducts: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { products, loading, error } = useProducts();

  const favoriteIds = user?.favoriteProductIds || [];
  const favoriteProducts = products.filter((product: any) =>
    favoriteIds.includes(String(product._id || product.id))
  );

  return (
    <UserDashboardLayout
      title="Sản phẩm yêu thích"
      subtitle="Quản lý các sản phẩm bạn đã lưu để xem lại nhanh hơn"
      icon={Heart}
      backTo="/dashboard"
      backLabel="Quay lại Dashboard"
    >
      {error ? (
        <ErrorState message="Lỗi tải danh sách yêu thích" onRetry={() => window.location.reload()} />
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="aspect-[3/4] rounded" />
          ))}
        </div>
      ) : favoriteProducts.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <span>Bạn đang lưu {favoriteProducts.length} sản phẩm yêu thích.</span>
            <Link to="/products" className="font-medium hover:underline">
              Tiếp tục khám phá
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {favoriteProducts.map((product: any, index: number) => (
              <ProductCard key={product._id || product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Chưa có sản phẩm yêu thích"
          description="Nhấn vào biểu tượng trái tim ở danh sách sản phẩm để lưu sản phẩm bạn quan tâm."
          action={{
            label: 'Đi đến trang sản phẩm',
            onClick: () => navigate('/products'),
          }}
        />
      )}
    </UserDashboardLayout>
  );
};
