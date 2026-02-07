import React from 'react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-light mb-6 tracking-wide">
            Câu chuyện của chúng tôi
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-3xl mx-auto">
            Bijoux Royale - Nơi nghệ thuật chế tác trang sức gặp gỡ di sản văn hóa
          </p>
        </div>

        {/* Image Section */}
        <div className="mb-20">
          <div className="relative h-[500px] rounded-sm overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1758631279366-8e8aeaf94082?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBqZXdlbHJ5JTIwc3RvcmUlMjBpbnRlcmlvcnxlbnwxfHx8fDE3Njk4NTkxOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="About Bijoux Royale"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Story */}
        <div className="max-w-4xl mx-auto space-y-12">
          <div>
            <h2 className="text-3xl font-light mb-6">Di sản và Truyền thống</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Được thành lập với niềm đam mê với nghệ thuật chế tác trang sức cao cấp, Bijoux Royale 
              đã và đang khẳng định vị thế là một trong những thương hiệu trang sức uy tín hàng đầu 
              tại Việt Nam. Chúng tôi tự hào mang đến những sản phẩm được chế tác tỉ mỉ từ những 
              nghệ nhân lành nghề nhất.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Mỗi món trang sức của Bijoux Royale đều mang trong mình một câu chuyện riêng, 
              được kể bằng ngôn ngữ của kim cương, vàng bạc và những viên đá quý thiên nhiên hiếm có.
            </p>
          </div>

          <div>
            <h2 className="text-3xl font-light mb-6">Giá trị cốt lõi</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">✦</span>
                </div>
                <h3 className="text-xl mb-3">Chất lượng</h3>
                <p className="text-gray-600 text-sm">
                  Cam kết sử dụng nguyên liệu cao cấp nhất từ khắp nơi trên thế giới
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">♦</span>
                </div>
                <h3 className="text-xl mb-3">Nghệ thuật</h3>
                <p className="text-gray-600 text-sm">
                  Mỗi sản phẩm là một tác phẩm nghệ thuật được chế tác tỉ mỉ
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#C9A24D] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">❖</span>
                </div>
                <h3 className="text-xl mb-3">Uy tín</h3>
                <p className="text-gray-600 text-sm">
                  Xây dựng niềm tin qua từng sản phẩm và dịch vụ tận tâm
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-light mb-6">Tầm nhìn</h2>
            <p className="text-gray-600 leading-relaxed">
              Chúng tôi hướng đến việc trở thành thương hiệu trang sức cao cấp hàng đầu khu vực, 
              mang đến cho khách hàng không chỉ là những món trang sức đẹp mắt, mà còn là những 
              kỷ vật đáng giá có thể lưu truyền qua nhiều thế hệ.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
