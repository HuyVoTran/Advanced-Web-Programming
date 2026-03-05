export interface BlogPost {
  title: string;
  date: string;
  excerpt: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: 'Xu hướng trang sức 2026: Tinh giản và sang trọng',
    date: '05/03/2026',
    excerpt: 'Sự kết hợp giữa thiết kế tối giản và chất liệu cao cấp tạo nên nét đẹp vượt thời gian.',
  },
  {
    title: 'Cách chọn nhẫn đính hôn phù hợp với phong cách',
    date: '28/02/2026',
    excerpt: 'Những tiêu chí cần lưu ý để chọn được chiếc nhẫn đính hôn hoàn hảo.',
  },
  {
    title: 'Bảo quản trang sức cao cấp đúng cách',
    date: '14/02/2026',
    excerpt: 'Các mẹo bảo quản giúp trang sức luôn sáng bóng và bền đẹp.',
  },
];
