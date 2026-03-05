import React from 'react';

export const LegalReturn: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light mb-6 tracking-wide">Chính sách đổi trả</h1>
          <p className="text-gray-600 mb-8">
            Chúng tôi hỗ trợ đổi trả với mục tiêu mang đến trải nghiệm mua sắm an tâm nhất.
          </p>

          <div className="space-y-6 text-gray-600">
            <div>
              <h2 className="text-xl text-gray-900 mb-2">1. Thời hạn đổi trả</h2>
              <p>Khách hàng có thể đổi trả trong vòng 7 ngày kể từ khi nhận hàng.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">2. Điều kiện đổi trả</h2>
              <p>Sản phẩm còn nguyên vẹn, không bị trầy xước và có đầy đủ phụ kiện đi kèm.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">3. Quy trình đổi trả</h2>
              <p>Vui lòng liên hệ bộ phận hỗ trợ để được hướng dẫn chi tiết trước khi gửi sản phẩm.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">4. Hoàn tiền</h2>
              <p>Hoàn tiền được thực hiện trong vòng 5-7 ngày làm việc sau khi xác nhận đổi trả.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
