import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, ArrowLeft, Share2, Check } from 'lucide-react';
import DOMPurify from 'dompurify';
import { newsAPI } from '@/services/api';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';
import { PageBreadcrumb } from '@/app/components/shared/PageBreadcrumb';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const sanitizedContent = useMemo(
    () => DOMPurify.sanitize(post?.content || ''),
    [post?.content]
  );

  useEffect(() => {
    const fetchDetail = async () => {
      if (!slug) {
        setError('Thiếu slug bài viết');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await newsAPI.getBySlug(slug);
        setPost(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết bài viết');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-5 w-56 mb-8" />
          <Skeleton className="h-80 w-full mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <ErrorState message={error || 'Không tìm thấy bài viết'} onRetry={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <PageBreadcrumb
          className="mb-6"
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Tin tức', href: '/blog' },
            { label: post.title },
          ]}
        />

        <Link to="/blog" className="inline-flex items-center gap-2 text-[#C9A24D] hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại trang tin tức
        </Link>

        <h1 className="text-4xl md:text-5xl font-light tracking-wide mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-8">
          <span className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            {new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}
          </span>
          <span>•</span>
          <span>{post.author || 'Admin'}</span>
          <button
            onClick={handleShare}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-gray-500 hover:border-[#C9A24D] hover:text-[#C9A24D] transition-colors text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                <span className="text-green-600">Đã sao chép</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Chia sẻ</span>
              </>
            )}
          </button>
        </div>

        {post.thumbnail && (
          <div className="rounded-xl overflow-hidden bg-gray-100 mb-8">
            <ImageWithFallback
              src={post.thumbnail}
              alt={post.title}
              className="w-full h-[320px] md:h-[420px] object-cover"
            />
          </div>
        )}

        <article
          className="prose prose-lg max-w-none text-gray-800 leading-8"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
};
