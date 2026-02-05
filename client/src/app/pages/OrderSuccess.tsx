import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          <h1 className="text-4xl font-light mb-4">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-2">
            Cảm ơn bạn đã tin tưởng Bijoux Royale
          </p>
          <p className="text-lg text-[#C9A24D] mb-8">
            Mã đơn hàng: <span className="font-medium">{orderId}</span>
          </p>
          <p className="text-gray-600 mb-8">
            Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.<br />
            Đơn hàng sẽ được xử lý trong vòng 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/orders"
              className="inline-block bg-[#C9A24D] text-white px-10 py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
            >
              Xem đơn hàng
            </Link>
            <Link
              to="/products"
              className="inline-block border border-gray-900 text-gray-900 px-10 py-3 text-sm tracking-wider uppercase hover:bg-gray-900 hover:text-white transition-colors duration-300"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
