import React from 'react';
import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'black';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    black: 'border-black',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

interface LoadingOverlayProps {
  text?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ text }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div className="bg-white rounded-lg p-8 shadow-2xl">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </motion.div>
  );
};

interface LoadingPageProps {
  text?: string;
}

export const LoadingPage: React.FC<LoadingPageProps> = ({ text = 'Đang tải...' }) => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};
