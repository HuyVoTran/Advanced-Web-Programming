import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { useNews } from '@/hooks/useCustomHooks';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';
import { SearchBar } from '@/app/components/shared/SearchBar';

export const Blog: React.FC = () => {
  const PAGE_SIZE = 9;
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, authorFilter, sortBy]);

  const { news, loading, error, pagination } = useNews({
    page: currentPage,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
    author: authorFilter === 'all' ? undefined : authorFilter,
    sort: sortBy,
  });

  const authors = useMemo(() => {
    const values = new Set<string>();
    news.forEach((item) => {
      if (item?.author) values.add(item.author);
    });
    return Array.from(values);
  }, [news]);

  const posts = useMemo(() => news, [news]);

  const totalPages = pagination?.totalPages || 1;
  const totalItems = pagination?.total || posts.length;

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from({ length: end - normalizedStart + 1 }, (_, i) => normalizedStart + i);
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wide">Tin tức</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Cập nhật những câu chuyện, xu hướng và kiến thức về trang sức cao cấp.
          </p>
        </div>

        <div className="mb-8 p-4 md:p-5 border border-gray-200 rounded-xl bg-white shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={setSearchQuery}
            placeholder="Tìm bài viết..."
            className="lg:col-span-6"
          />

          <div className="lg:col-span-4 flex gap-2">
            <select
              value={authorFilter}
              onChange={(e) => setAuthorFilter(e.target.value)}
              className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm bg-white"
            >
              <option value="all">Tất cả tác giả</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="h-11 rounded-md border border-gray-200 px-3 text-sm bg-white"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>

          <div className="lg:col-span-2 text-sm text-gray-600 text-right">
            {loading ? 'Đang tải...' : `${totalItems} bài viết`}
          </div>
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
          posts.length === 0 ? (
            <div className="text-center py-16 text-gray-500 border border-dashed border-gray-300 rounded-xl">
              Không tìm thấy bài viết phù hợp
            </div>
          ) : (
            <>
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
                          to={`/blog/${post.slug || post._id}`}
                          className="text-xs uppercase tracking-wider text-[#C9A24D] hover:underline"
                        >
                          Đọc thêm
                        </Link>
                      </div>
                    </div>
                  ))}
                </Masonry>
              </ResponsiveMasonry>

              {totalPages > 1 && (
                <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Trước
                  </button>

                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        page === currentPage
                          ? 'bg-[#C9A24D] text-white border-[#C9A24D]'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Sau
                  </button>
                </div>
              )}
            </>
          )
        )}
        </div>
      </div>
    </div>
  );
};
