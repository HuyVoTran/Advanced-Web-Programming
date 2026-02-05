import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/data/mockData';
import { ImageWithFallback } from '@/app/components/figma/ImageWithFallback';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const imageUrl = `https://source.unsplash.com/800x1000/?${encodeURIComponent(category.image)}`;

  return (
    <Link to={`/products?category=${category.id}`} className="group block">
      <div className="relative overflow-hidden bg-gray-100 aspect-square rounded-sm">
        <ImageWithFallback
          src={imageUrl}
          alt={category.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300" />
        
        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
          <h3 className="text-3xl md:text-4xl font-light mb-3 tracking-wider">
            {category.name}
          </h3>
          <p className="text-sm text-white/90 mb-6 text-center max-w-xs">
            {category.description}
          </p>
          <span className="inline-block border border-white px-8 py-2 text-sm tracking-wider uppercase group-hover:bg-white group-hover:text-gray-900 transition-all duration-300">
            Xem thêm
          </span>
        </div>
      </div>
    </Link>
  );
};
