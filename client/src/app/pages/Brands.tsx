import React from 'react';

export const Brands: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wide">Thương hiệu</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Salvio Royale là thương hiệu trang sức cao cấp đến từ Việt Nam, thành lập năm 2026.
            Chúng tôi tôn vinh tinh thần thủ công truyền thống kết hợp cùng chuẩn mực thiết kế hiện đại.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-10 text-gray-600">
          <div>
            <h2 className="text-2xl text-gray-900 mb-3">Câu chuyện thương hiệu</h2>
            <p>
              Với sứ mệnh đưa trang sức Việt Nam vươn tầm quốc tế, Salvio Royale xây dựng hệ sinh thái
              chế tác tinh xảo, chăm chút từng chi tiết, đảm bảo tiêu chuẩn khắt khe về chất lượng và
              trải nghiệm khách hàng.
            </p>
          </div>
          <div>
            <h2 className="text-2xl text-gray-900 mb-3">Xuất xứ và di sản</h2>
            <p>
              Khởi nguồn tại Việt Nam, chúng tôi lấy cảm hứng từ văn hoá bản địa và tinh hoa thủ công
              Á Đông, tạo nên những bộ sưu tập mang bản sắc riêng nhưng vẫn bắt kịp xu hướng toàn cầu.
            </p>
          </div>
          <div>
            <h2 className="text-2xl text-gray-900 mb-3">Giá trị cốt lõi</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Chất lượng vượt trội, chế tác tỉ mỉ từng chi tiết.</li>
              <li>Thiết kế sang trọng, phù hợp với nhiều phong cách.</li>
              <li>Dịch vụ tận tâm và cá nhân hoá trải nghiệm khách hàng.</li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-16">
          <div className="border border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center text-gray-500">
            Khu vực chèn ảnh thương hiệu (placeholder)
          </div>
        </div>
      </div>
    </div>
  );
};
