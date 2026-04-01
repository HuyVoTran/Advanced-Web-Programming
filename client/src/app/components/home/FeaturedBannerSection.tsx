import React from 'react';
import { Link } from 'react-router-dom';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

export const FeaturedBannerSection: React.FC = () => {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative h-[500px] overflow-hidden rounded-sm">
          <ImageWithFallback
            src="/images/SalvioRoyale-NewCollection.png"
            alt="Featured Collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <Link
              to="/products"
              className="inline-block bg-white text-gray-900 mt-50 px-8 py-4 text-sm tracking-wider uppercase hover:bg-[#C9A24D] hover:text-white transition-all duration-300"
            >
              Khám phá ngay
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
