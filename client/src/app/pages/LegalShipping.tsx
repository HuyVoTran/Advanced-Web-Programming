import React from 'react';

export const LegalShipping: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light mb-6 tracking-wide">Chính sách giao hàng</h1>
          <p className="text-gray-600 mb-8">
            Salvio Royale đảm bảo giao hàng an toàn và đúng hẹn trên toàn quốc.
          </p>

          <div className="space-y-6 text-gray-600">
            <div>
              <h2 className="text-xl text-gray-900 mb-2">1. Thời gian giao hàng</h2>
              <p>Giao hàng nội thành trong 1-2 ngày, ngoại thành trong 3-5 ngày làm việc.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">2. Phí vận chuyển</h2>
              <p>Miễn phí vận chuyển cho đơn hàng từ 0 VNĐ trong giai đoạn ưu đãi.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">3. Theo dõi đơn hàng</h2>
              <p>Khách hàng có thể theo dõi trạng thái đơn hàng trong mục Lịch sử đơn hàng.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">4. Lưu ý nhận hàng</h2>
              <p>Vui lòng kiểm tra sản phẩm trước khi ký nhận để đảm bảo quyền lợi đổi trả.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
