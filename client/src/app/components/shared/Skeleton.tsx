import React from 'react';
import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  count = 1,
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-md';
      case 'text':
      default:
        return 'rounded';
    }
  };

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1em' : variant === 'circular' ? '40px' : '100px'),
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`bg-gray-200 ${getVariantClass()} ${className}`}
          style={style}
        />
      ))}
    </>
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="group relative bg-white">
      <Skeleton variant="rectangular" height="400px" className="mb-4" />
      <Skeleton variant="text" width="80%" className="mb-2" />
      <Skeleton variant="text" width="60%" className="mb-2" />
      <Skeleton variant="text" width="40%" />
    </div>
  );
};

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 lg:px-8 pt-32 pb-16">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <Skeleton variant="rectangular" height="600px" className="mb-4" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton variant="rectangular" height="120px" />
            <Skeleton variant="rectangular" height="120px" />
            <Skeleton variant="rectangular" height="120px" />
            <Skeleton variant="rectangular" height="120px" />
          </div>
        </div>

        {/* Info */}
        <div>
          <Skeleton variant="text" width="60%" height="32px" className="mb-2" />
          <Skeleton variant="text" width="80%" className="mb-4" />
          <Skeleton variant="text" width="40%" height="40px" className="mb-6" />
          <Skeleton variant="text" count={4} className="mb-2" />
          <div className="flex gap-4 mt-8">
            <Skeleton variant="rectangular" width="150px" height="48px" />
            <Skeleton variant="rectangular" width="150px" height="48px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({ 
  rows = 5, 
  columns = 5 
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" height="20px" />
          ))}
        </div>
      ))}
    </div>
  );
};
