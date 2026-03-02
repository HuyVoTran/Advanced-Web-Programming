import React from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ArrowProps {
  onClick?: () => void;
}

const NextArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
  >
    <ChevronRight className="w-6 h-6" />
  </button>
);

const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center text-white hover:bg-white/30 transition-all duration-300"
  >
    <ChevronLeft className="w-6 h-6" />
  </button>
);

export const HeroCarousel: React.FC = () => {
  const slides = [
    {
      image: 'https://i.pinimg.com/1200x/5c/37/70/5c3770d600bd7f7f3859196b182db006.jpg',
      title: 'Bộ Sưu Tập Kim Cương',
      subtitle: 'Vẻ đẹp vĩnh cửu từ thiên nhiên',
      cta: 'Khám phá ngay',
    },
    {
      image: 'https://i.pinimg.com/1200x/c3/ab/cb/c3abcbd1eb2eebdc0dbefa6b53f5d1b9.jpg',
      title: 'Vàng Ý Cao Cấp',
      subtitle: 'Nghệ thuật chế tác từ Italia',
      cta: 'Xem bộ sưu tập',
    },
    {
      image: 'https://i.pinimg.com/1200x/2a/d6/a1/2ad6a10031953dc7d6c81facfc3ebe19.jpg',
      title: 'Trang Sức Cao Cấp',
      subtitle: 'Sự lựa chọn của người sành điệu',
      cta: 'Khám phá thêm',
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots: React.ReactNode) => (
      <div className="absolute bottom-8">
        <ul className="flex space-x-2"> {dots} </ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-white/80 transition-all duration-300" />
    ),
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Slider {...settings} className="h-full">
        {slides.map((slide, index) => (
          <div key={index} className="relative h-screen w-full">
            <div className="absolute inset-0 bg-black/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-5xl md:text-7xl font-light text-white mb-4 tracking-wider">
                {slide.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8 font-light max-w-2xl">
                {slide.subtitle}
              </p>
              <Link
                to="/products"
                className="inline-block bg-[#C9A24D] text-white px-10 py-4 text-sm tracking-wider uppercase hover:bg-[#b8923f] transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {slide.cta}
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};
