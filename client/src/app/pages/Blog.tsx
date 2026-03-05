import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useNews } from '@/hooks/useCustomHooks';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';

export const Blog: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('search') || '').toLowerCase();
  const { news, loading, error } = useNews();

  const posts = useMemo(() => {
    if (!query) return news;
    return news.filter((post) =>
      (post.title || '').toLowerCase().includes(query) ||
      (post.content || '').toLowerCase().includes(query)
    );
  }, [query, news]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wide">Tin tức</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cập nhật những câu chuyện, xu hướng và kiến thức về trang sức cao cấp.
          </p>
        </div>

        {error ? (
          <ErrorState message="Lỗi tải tin tức" onRetry={() => window.location.reload()} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded" />
            ))}
          </div>
        ) : (
          <ResponsiveMasonry
            columnsCountBreakPoints={{ 350: 1, 768: 2, 1024: 3 }}
          >
            <Masonry gutter="24px">
              {posts.map((post) => (
                <div key={post._id || post.title} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  {post.thumbnail && (
                    <div className="h-48 bg-gray-100">
                      <ImageWithFallback
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <CalendarDays className="w-4 h-4" />
                      <span>{new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <h2 className="text-xl font-light mb-3">{post.title}</h2>
                    <p className="text-gray-600 mb-6 line-clamp-4">
                      {post.content}
                    </p>
                    <Link
                      to={`/blog?search=${encodeURIComponent(post.title)}`}
                      className="text-xs uppercase tracking-wider text-[#C9A24D] hover:underline"
                    >
                      Đọc thêm
                    </Link>
                  </div>
                </div>
              ))}
            </Masonry>
          </ResponsiveMasonry>
        )}
      </div>
    </div>
  );
};
