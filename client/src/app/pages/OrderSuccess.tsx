import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto py-20">
          <div className="text-center mb-8">
            <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
            <h1 className="text-4xl font-light mb-4">Đặt hàng thành công!</h1>
            <p className="text-gray-600 mb-2">
              Cảm ơn bạn đã tin tưởng Salvio Royale
            </p>
            <p className="text-lg text-[#C9A24D] mb-8">
              Mã đơn hàng: <span className="font-medium">{orderId}</span>
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium mb-2">Chờ xác nhận đơn hàng</p>
                <p className="text-yellow-700 text-sm">
                  Đơn hàng của bạn đang chờ xác nhận từ admin. Chúng tôi sẽ liên hệ với bạn trong vòng 24h để xác nhận và sắp xếp giao hàng.
                </p>
                <p className="text-yellow-700 text-sm mt-2">
                  Phương thức thanh toán: <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                </p>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-8 text-center">
            Chúng tôi đã gửi email xác nhận đến địa chỉ email của bạn.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/orders/${orderId}`}
              className="inline-block bg-[#C9A24D] text-white px-10 py-3 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-colors duration-300"
            >
              Xem chi tiết đơn hàng
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
