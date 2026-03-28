import React, { useRef } from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';
import { PageBreadcrumb } from '@/app/components/shared/PageBreadcrumb';
import { useCategories } from '@/hooks/useCustomHooks';
import { Skeleton } from '@/app/components/shared/Skeleton';
import { ErrorState } from '@/app/components/shared/ErrorState';

interface ArrowProps {
  onClick?: () => void;
}

const NextArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300"
    aria-label="Next"
  >
    <ChevronRight className="w-5 h-5" />
  </button>
);

const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-white/90 shadow-md flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300"
    aria-label="Previous"
  >
    <ChevronLeft className="w-5 h-5" />
  </button>
);

export const Categories: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const dragStartX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const settings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    draggable: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <PageBreadcrumb
          className="mb-8"
          items={[
            { label: 'Trang chủ', href: '/' },
            { label: 'Danh mục' },
          ]}
        />

        <section className="mb-16">
          <div className="relative h-[380px] md:h-[460px] overflow-hidden rounded-sm">
            <ImageWithFallback
              src="/images/SalvioRoyale-NewCollection.png"
              alt="New Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
              <Link
                to="/products"
                className="inline-block bg-white text-gray-900 mt-50 px-8 py-3 text-sm tracking-wider uppercase hover:bg-[#C9A24D] hover:text-white transition-all duration-300"
              >
                Khám phá ngay
              </Link>
            </div>
          </div>
        </section>

        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wide">Danh mục</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Khám phá các dòng sản phẩm trang sức cao cấp với thiết kế đẳng cấp và chất liệu tinh tuyển.
          </p>
        </div>

        {error ? (
          <ErrorState message="Lỗi tải danh mục" onRetry={() => window.location.reload()} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : (
          <div className="relative">
            <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-white to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 h-full w-16 bg-gradient-to-l from-white to-transparent z-10" />

            <Slider {...settings} className="category-carousel">
              {categories.map((category) => (
                <div
                  key={category._id || category.id}
                  className="px-3"
                  onMouseDown={(event) => {
                    dragStartX.current = event.clientX;
                    isDragging.current = false;
                  }}
                  onMouseMove={(event) => {
                    if (dragStartX.current === null) return;
                    if (Math.abs(event.clientX - dragStartX.current) > 6) {
                      isDragging.current = true;
                    }
                  }}
                  onMouseUp={() => {
                    dragStartX.current = null;
                  }}
                  onMouseLeave={() => {
                    dragStartX.current = null;
                  }}
                  onTouchStart={(event) => {
                    dragStartX.current = event.touches[0]?.clientX ?? null;
                    isDragging.current = false;
                  }}
                  onTouchMove={(event) => {
                    if (dragStartX.current === null) return;
                    if (Math.abs((event.touches[0]?.clientX ?? 0) - dragStartX.current) > 6) {
                      isDragging.current = true;
                    }
                  }}
                  onTouchEnd={() => {
                    dragStartX.current = null;
                  }}
                >
                  <Link
                    to={`/products?category=${category._id || category.id}`}
                    className="group block"
                    draggable={false}
                    onDragStart={(event) => event.preventDefault()}
                    onClick={(event) => {
                      if (isDragging.current) {
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    }}
                  >
                    <div className="relative overflow-hidden bg-gray-100 aspect-square rounded-sm">
                      <ImageWithFallback
                        src={category.image || 'https://source.unsplash.com/800x1000/?jewelry'}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        draggable={false}
                        onDragStart={(event) => event.preventDefault()}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                        <h3 className="text-2xl md:text-3xl font-light mb-3 tracking-wider text-center">
                          {category.name}
                        </h3>
                        <p className="text-sm text-white/90 mb-6 text-center max-w-xs line-clamp-3">
                          {category.description || `${category.productCount || 0} sản phẩm`}
                        </p>
                        <span className="inline-block border border-white px-8 py-2 text-sm tracking-wider uppercase group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
                          Xem thêm
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </Slider>
          </div>
        )}
      </div>
    </div>
  );
};
