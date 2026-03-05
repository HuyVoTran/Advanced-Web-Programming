import React from 'react';

export const LegalPrivacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-light mb-6 tracking-wide">Chính sách bảo mật</h1>
          <p className="text-gray-600 mb-8">
            Salvio Royale cam kết bảo vệ thông tin cá nhân của bạn với tiêu chuẩn bảo mật cao nhất.
          </p>

          <div className="space-y-6 text-gray-600">
            <div>
              <h2 className="text-xl text-gray-900 mb-2">1. Thu thập dữ liệu</h2>
              <p>Chúng tôi thu thập các thông tin cần thiết để xử lý đơn hàng và nâng cao trải nghiệm.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">2. Sử dụng dữ liệu</h2>
              <p>Dữ liệu được sử dụng để xác nhận giao dịch, chăm sóc khách hàng và cá nhân hoá dịch vụ.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">3. Chia sẻ thông tin</h2>
              <p>Chúng tôi không chia sẻ dữ liệu với bên thứ ba nếu không có sự đồng ý của bạn.</p>
            </div>
            <div>
              <h2 className="text-xl text-gray-900 mb-2">4. Quyền của khách hàng</h2>
              <p>Bạn có quyền yêu cầu chỉnh sửa hoặc xóa dữ liệu cá nhân theo quy định.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
