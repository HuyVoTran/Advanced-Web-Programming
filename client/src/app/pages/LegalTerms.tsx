import React from 'react';

export const LegalTerms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light mb-6 tracking-wide">Điều khoản sử dụng</h1>
          <p className="text-gray-600 mb-8">
            Khi truy cập và sử dụng Salvio Royale, bạn đồng ý tuân thủ các điều khoản dưới đây.
          </p>

          <div className="space-y-6 text-gray-600">
            <div>
              <h2 className="text-xl text-gray-900 mb-2">1. Phạm vi áp dụng</h2>
              <p>Điều khoản này áp dụng cho mọi giao dịch và tương tác trên hệ thống Salvio Royale.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">2. Tài khoản khách hàng</h2>
              <p>Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và mọi hoạt động trên tài khoản.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">3. Sản phẩm và giá</h2>
              <p>Chúng tôi có quyền cập nhật giá và mô tả sản phẩm mà không cần thông báo trước.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">4. Thanh toán</h2>
              <p>Đơn hàng chỉ được xác nhận khi hệ thống ghi nhận thanh toán thành công.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
