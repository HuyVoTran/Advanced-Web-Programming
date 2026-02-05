import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo & About */}
          <div>
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-light tracking-wider">
                <span className="text-[#C9A24D]">BIJOUX</span>
                <span className="text-white"> ROYALE</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Trang sức cao cấp dành cho những người sành điệu. Chúng tôi mang đến những thiết kế tinh tế, sang trọng và đẳng cấp.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg mb-6 text-white">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Tin tức
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg mb-6 text-white">Hỗ trợ khách hàng</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/legal/terms" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Điều khoản sử dụng
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link to="/legal/return" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Chính sách đổi trả
                </Link>
              </li>
              <li>
                <Link to="/legal/shipping" className="text-gray-400 hover:text-[#C9A24D] transition-colors duration-300 text-sm">
                  Chính sách giao hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg mb-6 text-white">Liên hệ</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#C9A24D] flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">
                  123 Đường Lê Lợi, Quận 1,<br />Hồ Chí Minh, Việt Nam
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#C9A24D]" />
                <span className="text-gray-400 text-sm">1900 1234</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#C9A24D]" />
                <span className="text-gray-400 text-sm">info@bijouxroyale.vn</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; 2026 Bijoux Royale. Bảo lưu mọi quyền.
          </p>
        </div>
      </div>
    </footer>
  );
};
