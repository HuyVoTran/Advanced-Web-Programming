import React from 'react';
import { Link } from 'react-router-dom';
import { HeroCarousel } from '@/app/components/HeroCarousel';
import { ProductCard } from '@/app/components/ProductCard';
import { CategoryCard } from '@/app/components/CategoryCard';
import { Newsletter } from '@/app/components/Newsletter';
import { products, categories } from '@/data/mockData';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export const Home: React.FC = () => {
  const newProducts = products.filter(p => p.new).slice(0, 4);
  const featuredProducts = products.filter(p => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* New Products Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
              Sản phẩm mới
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Khám phá những thiết kế mới nhất từ các thương hiệu cao cấp
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {newProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>

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

      {/* Categories Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
              Danh mục sản phẩm
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Khám phá bộ sưu tập đa dạng của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Collection Banner */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative h-[500px] overflow-hidden rounded-sm">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758631279366-8e8aeaf94082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwc3RvcmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk4NTkxOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Featured Collection"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
              <h2 className="text-4xl md:text-6xl font-light mb-4 tracking-wider">
                Bộ Sưu Tập Xuân 2026
              </h2>
              <p className="text-xl md:text-2xl font-light mb-8 max-w-2xl">
                Sự kết hợp hoàn hảo giữa truyền thống và hiện đại
              </p>
              <Link
                to="/products"
                className="inline-block bg-white text-gray-900 px-10 py-4 text-sm tracking-wider uppercase hover:bg-[#C9A24D] hover:text-white transition-all duration-300"
              >
                Khám phá ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 tracking-wide">
              Sản phẩm nổi bật
            </h2>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Những món trang sức được yêu thích nhất
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </div>
  );
};
