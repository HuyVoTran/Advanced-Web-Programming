import React from 'react';
import Slider from 'react-slick';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type CtaAlign = 'left' | 'center' | 'right';

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
      image: '/images/SalvioRoyale-Banner1.png',
      cta: 'Khám phá ngay',
      ctaLink: '/products',
      ctaAlign: 'center' as CtaAlign,
    },
    {
      image: '/images/SalvioRoyale-Banner2.png',
      cta: 'Xem bộ sưu tập',
      ctaLink: '/products',
      ctaAlign: 'left' as CtaAlign,
    },
    {
      image: '/images/SalvioRoyale-Banner3.png',
      cta: 'Khám phá thêm',
      ctaLink: '/products',
      ctaAlign: 'right' as CtaAlign,
    },
  ];

  const ctaAlignmentClasses: Record<CtaAlign, string> = {
    left: 'justify-start pl-3 md:pl-20 lg:pl-40',
    center: 'justify-center',
    right: 'justify-end pr-3 md:pr-45 lg:pr-85',
  };

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
            <img
              src={slide.image}
              alt={slide.cta}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-x-0 bottom-[10%] z-20 flex px-6 md:px-12 lg:px-20 ${ctaAlignmentClasses[slide.ctaAlign || 'center']}`}>
              <Link
                to={slide.ctaLink || '/products'}
                className="inline-flex items-center justify-center bg-[#C9A24D] text-white px-5 py-2.5 text-[11px] md:text-xs tracking-[0.22em] uppercase rounded-sm hover:bg-[#b8923f] transition-all duration-300"
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
