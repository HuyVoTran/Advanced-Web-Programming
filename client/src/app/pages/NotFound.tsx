import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle className="w-20 h-20 mx-auto mb-6 text-gray-400" />
          <h1 className="text-4xl font-light mb-4">404 - Không tìm thấy</h1>
          <p className="text-gray-600 mb-8">
            Trang bạn truy cập không tồn tại hoặc bạn không có quyền truy cập.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-block bg-[#C9A24D] text-white px-10 py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
            >
              Về trang chủ
            </Link>
            <Link
              to="/products"
              className="inline-block border border-gray-900 text-gray-900 px-10 py-3 text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              Xem sản phẩm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
