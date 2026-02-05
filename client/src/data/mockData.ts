export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  brand: string;
  material: string;
  description: string;
  images: string[];
  featured: boolean;
  new: boolean;
  stock?: number;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
  productCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  userId?: string; // undefined for guest orders
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'bank_transfer' | 'credit_card';
  createdAt: string;
  updatedAt: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
}

export const brands: Brand[] = [
  { id: '1', name: 'Aurelia Collection', description: 'Thương hiệu trang sức cao cấp với thiết kế hiện đại' },
  { id: '2', name: 'Lumière Royale', description: 'Trang sức sang trọng phong cách hoàng gia' },
  { id: '3', name: 'Éclat Bijoux', description: 'Đá quý và kim cương chất lượng hàng đầu' },
  { id: '4', name: 'Bella Gemma', description: 'Thiết kế tinh tế cho phái đẹp' },
  { id: '5', name: 'Prestige Diamonds', description: 'Chuyên gia về kim cương cao cấp' },
];

export const categories: Category[] = [
  { 
    id: '1', 
    name: 'Nhẫn', 
    image: 'luxury diamond ring',
    description: 'Bộ sưu tập nhẫn cao cấp'
  },
  { 
    id: '2', 
    name: 'Dây chuyền', 
    image: 'luxury gold necklace',
    description: 'Dây chuyền và mặt dây sang trọng'
  },
  { 
    id: '3', 
    name: 'Vòng tay', 
    image: 'luxury bracelet',
    description: 'Vòng tay và lắc tay tinh tế'
  },
  { 
    id: '4', 
    name: 'Bông tai', 
    image: 'luxury earrings',
    description: 'Bông tai kim cương và đá quý'
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Nhẫn Kim Cương Vĩnh Cửu',
    price: 125000000,
    category: 'Nhẫn',
    brand: 'Prestige Diamonds',
    material: 'Vàng trắng 18K, Kim cương 2.5ct',
    description: 'Nhẫn kim cương cao cấp với thiết kế vượt thời gian. Viên kim cương chính 2.5ct được bao quanh bởi những viên kim cương nhỏ lấp lánh, tạo nên vẻ đẹp sang trọng và quý phái.',
    images: ['luxury diamond engagement ring', 'diamond ring close up'],
    featured: true,
    new: true,
  },
  {
    id: '2',
    name: 'Dây Chuyền Ngọc Trai Akoya',
    price: 85000000,
    category: 'Dây chuyền',
    brand: 'Lumière Royale',
    material: 'Vàng 18K, Ngọc trai Akoya',
    description: 'Dây chuyền ngọc trai Akoya cao cấp từ Nhật Bản với ánh sáng rực rỡ và bề mặt hoàn hảo. Mỗi viên ngọc được tuyển chọn kỹ lưỡng để đảm bảo chất lượng tuyệt hảo.',
    images: ['luxury pearl necklace', 'akoya pearl jewelry'],
    featured: true,
    new: false,
  },
  {
    id: '3',
    name: 'Vòng Tay Vàng Hồng Ý',
    price: 42000000,
    category: 'Vòng tay',
    brand: 'Aurelia Collection',
    material: 'Vàng hồng 18K',
    description: 'Vòng tay vàng hồng với kiểu dáng Italia sang trọng. Thiết kế tinh xảo với họa tiết khắc tay tỉ mỉ, thể hiện sự đẳng cấp và tinh tế.',
    images: ['luxury gold bracelet', 'rose gold jewelry'],
    featured: false,
    new: true,
  },
  {
    id: '4',
    name: 'Bông Tai Emerald Hoàng Gia',
    price: 156000000,
    category: 'Bông tai',
    brand: 'Éclat Bijoux',
    material: 'Vàng trắng 18K, Emerald, Kim cương',
    description: 'Bông tai emerald cao cấp với thiết kế lấy cảm hứng từ phong cách hoàng gia. Đá emerald xanh lục bảo thiên nhiên kết hợp cùng kim cương tạo nên vẻ đẹp lộng lẫy.',
    images: ['luxury emerald earrings', 'royal jewelry earrings'],
    featured: true,
    new: false,
  },
  {
    id: '5',
    name: 'Nhẫn Ruby Đỏ Thắm',
    price: 95000000,
    category: 'Nhẫn',
    brand: 'Bella Gemma',
    material: 'Vàng 18K, Ruby 3ct, Kim cương',
    description: 'Nhẫn ruby thiên nhiên với màu đỏ thắm quyến rũ. Viên ruby chính được bao quanh bởi vòng kim cương, tạo nên thiết kế cổ điển và thanh lịch.',
    images: ['luxury ruby ring', 'red gemstone ring'],
    featured: false,
    new: true,
  },
  {
    id: '6',
    name: 'Dây Chuyền Vàng Ý Cao Cấp',
    price: 68000000,
    category: 'Dây chuyền',
    brand: 'Aurelia Collection',
    material: 'Vàng 18K',
    description: 'Dây chuyền vàng Italia với thiết kế đan xen tinh tế. Mỗi mắt xích được chế tác thủ công tỉ mỉ, mang đến vẻ đẹp sang trọng và bền vững.',
    images: ['luxury gold chain necklace', 'italian gold jewelry'],
    featured: false,
    new: false,
  },
  {
    id: '7',
    name: 'Vòng Tay Kim Cương Tennis',
    price: 185000000,
    category: 'Vòng tay',
    brand: 'Prestige Diamonds',
    material: 'Vàng trắng 18K, Kim cương 15ct',
    description: 'Vòng tay tennis kim cương với 50 viên kim cương xếp liền mạch. Thiết kế thanh lịch và lộng lẫy, phù hợp cho các dịp quan trọng.',
    images: ['luxury diamond tennis bracelet', 'diamond bracelet'],
    featured: true,
    new: false,
  },
  {
    id: '8',
    name: 'Bông Tai Sapphire Xanh',
    price: 142000000,
    category: 'Bông tai',
    brand: 'Lumière Royale',
    material: 'Vàng trắng 18K, Sapphire, Kim cương',
    description: 'Bông tai sapphire xanh Ceylon cao cấp. Đá sapphire thiên nhiên với màu xanh đậm đà được bao quanh bởi kim cương, tạo nên vẻ đẹp quý phái.',
    images: ['luxury sapphire earrings', 'blue gemstone earrings'],
    featured: false,
    new: true,
  },
  {
    id: '9',
    name: 'Nhẫn Cưới Platinum',
    price: 52000000,
    category: 'Nhẫn',
    brand: 'Éclat Bijoux',
    material: 'Platinum 950, Kim cương',
    description: 'Nhẫn cưới platinum với thiết kế tối giản và tinh tế. Dải kim cương nhỏ chạy quanh nhẫn tạo nên vẻ đẹp lấp lánh nhưng không kém phần sang trọng.',
    images: ['luxury platinum wedding ring', 'minimalist diamond ring'],
    featured: false,
    new: false,
  },
  {
    id: '10',
    name: 'Dây Chuyền Mặt Trời',
    price: 78000000,
    category: 'Dây chuyền',
    brand: 'Bella Gemma',
    material: 'Vàng 18K, Kim cương',
    description: 'Dây chuyền với mặt pendant hình mặt trời độc đáo. Kim cương được khảm tinh xảo tạo thành những tia sáng rực rỡ, biểu tượng của năng lượng và sức sống.',
    images: ['luxury sun pendant necklace', 'gold diamond necklace'],
    featured: false,
    new: true,
  },
  {
    id: '11',
    name: 'Vòng Tay Ngọc Bích Jadeite',
    price: 215000000,
    category: 'Vòng tay',
    brand: 'Lumière Royale',
    material: 'Ngọc bích Jadeite Myanmar',
    description: 'Vòng tay ngọc bích jadeite cao cấp từ Myanmar với màu xanh đậm tự nhiên. Mỗi chiếc đều là độc bản, mang ý nghĩa may mắn và bình an.',
    images: ['luxury jade bracelet', 'jadeite bangle'],
    featured: true,
    new: false,
  },
  {
    id: '12',
    name: 'Bông Tai Châu Ngọc Trai Nam Dương',
    price: 165000000,
    category: 'Bông tai',
    brand: 'Prestige Diamonds',
    material: 'Vàng trắng 18K, Ngọc trai Nam Dương, Kim cương',
    description: 'Bông tai ngọc trai Nam Dương với kích thước lớn và ánh bạc độc đáo. Được đính kim cương cao cấp, tạo nên sự kết hợp hoàn hảo giữa cổ điển và hiện đại.',
    images: ['luxury south sea pearl earrings', 'pearl diamond earrings'],
    featured: false,
    new: true,
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Xu Hướng Trang Sức Cao Cấp 2026',
    excerpt: 'Khám phá những xu hướng trang sức cao cấp đang làm mưa làm gió trong năm 2026 với thiết kế tối giản và bền vững.',
    content: 'Năm 2026 chứng kiến sự trở lại mạnh mẽ của phong cách tối giản trong thiết kế trang sức cao cấp. Các thương hiệu lớn đều hướng đến sự bền vững và chất lượng thay vì số lượng...',
    image: 'luxury jewelry trends 2026',
    date: '2026-01-15',
    author: 'Nguyễn Minh Anh',
  },
  {
    id: '2',
    title: 'Cách Chọn Kim Cương Hoàn Hảo',
    excerpt: 'Hướng dẫn chi tiết về 4C của kim cương và cách chọn viên kim cương phù hợp với ngân sách của bạn.',
    content: 'Kim cương được đánh giá dựa trên 4 tiêu chí chính: Cut (Giác cắt), Clarity (Độ tinh khiết), Color (Màu sắc), và Carat (Trọng lượng)...',
    image: 'diamond buying guide',
    date: '2026-01-20',
    author: 'Trần Văn Hoàng',
  },
  {
    id: '3',
    title: 'Bí Quyết Bảo Quản Trang Sức Vàng',
    excerpt: 'Những mẹo đơn giản giúp trang sức vàng của bạn luôn sáng bóng và bền đẹp theo thời gian.',
    content: 'Trang sức vàng cần được bảo quản đúng cách để duy trì vẻ đẹp lâu dài. Hãy tránh tiếp xúc với hóa chất, nước biển và bảo quản ở nơi khô ráo...',
    image: 'gold jewelry care',
    date: '2026-01-25',
    author: 'Lê Thu Hà',
  },
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
};

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'nguyen.van.a@email.com',
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    role: 'USER',
    createdAt: '2025-10-15T08:30:00Z',
    addresses: [
      {
        id: 'addr1',
        fullName: 'Nguyễn Văn A',
        phone: '0901234567',
        address: '123 Nguyễn Huệ',
        city: 'TP. Hồ Chí Minh',
        district: 'Quận 1',
        isDefault: true,
      },
    ],
  },
  {
    id: 'user2',
    email: 'tran.thi.b@email.com',
    fullName: 'Trần Thị B',
    phone: '0912345678',
    role: 'USER',
    createdAt: '2025-11-20T14:20:00Z',
    addresses: [
      {
        id: 'addr2',
        fullName: 'Trần Thị B',
        phone: '0912345678',
        address: '456 Lê Lợi',
        city: 'Hà Nội',
        district: 'Quận Hoàn Kiếm',
        isDefault: true,
      },
    ],
  },
  {
    id: 'user3',
    email: 'le.van.c@email.com',
    fullName: 'Lê Văn C',
    phone: '0923456789',
    role: 'USER',
    createdAt: '2025-12-05T10:15:00Z',
    addresses: [],
  },
  {
    id: 'admin1',
    email: 'admin@luxuryjewelry.com',
    fullName: 'Admin Hệ Thống',
    phone: '0987654321',
    role: 'ADMIN',
    createdAt: '2025-01-01T00:00:00Z',
    addresses: [],
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'order1',
    userId: 'user1',
    orderNumber: 'LJ2026010001',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyen.van.a@email.com',
    customerPhone: '0901234567',
    shippingAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    items: [
      {
        productId: '1',
        productName: 'Nhẫn Kim Cương Vĩnh Cửu',
        productImage: 'luxury diamond engagement ring',
        price: 125000000,
        quantity: 1,
      },
    ],
    subtotal: 125000000,
    shippingFee: 0,
    total: 125000000,
    status: 'delivered',
    paymentMethod: 'bank_transfer',
    createdAt: '2026-01-15T10:30:00Z',
    updatedAt: '2026-01-20T14:00:00Z',
    note: 'Giao hàng vào buổi chiều',
  },
  {
    id: 'order2',
    userId: 'user2',
    orderNumber: 'LJ2026010002',
    customerName: 'Trần Thị B',
    customerEmail: 'tran.thi.b@email.com',
    customerPhone: '0912345678',
    shippingAddress: '456 Lê Lợi, Quận Hoàn Kiếm, Hà Nội',
    items: [
      {
        productId: '2',
        productName: 'Dây Chuyền Ngọc Trai Akoya',
        productImage: 'luxury pearl necklace',
        price: 85000000,
        quantity: 1,
      },
      {
        productId: '3',
        productName: 'Vòng Tay Vàng Hồng Ý',
        productImage: 'luxury gold bracelet',
        price: 42000000,
        quantity: 1,
      },
    ],
    subtotal: 127000000,
    shippingFee: 0,
    total: 127000000,
    status: 'shipping',
    paymentMethod: 'cod',
    createdAt: '2026-01-25T09:15:00Z',
    updatedAt: '2026-01-28T11:30:00Z',
  },
  {
    id: 'order3',
    orderNumber: 'LJ2026010003',
    customerName: 'Phạm Văn D',
    customerEmail: 'pham.van.d@email.com',
    customerPhone: '0934567890',
    shippingAddress: '789 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh',
    items: [
      {
        productId: '4',
        productName: 'Bông Tai Emerald Hoàng Gia',
        productImage: 'luxury emerald earrings',
        price: 156000000,
        quantity: 1,
      },
    ],
    subtotal: 156000000,
    shippingFee: 0,
    total: 156000000,
    status: 'confirmed',
    paymentMethod: 'bank_transfer',
    createdAt: '2026-01-28T16:45:00Z',
    updatedAt: '2026-01-29T09:00:00Z',
    note: 'Khách hàng guest checkout',
  },
  {
    id: 'order4',
    userId: 'user1',
    orderNumber: 'LJ2026010004',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyen.van.a@email.com',
    customerPhone: '0901234567',
    shippingAddress: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
    items: [
      {
        productId: '7',
        productName: 'Vòng Tay Kim Cương Tennis',
        productImage: 'luxury diamond tennis bracelet',
        price: 185000000,
        quantity: 1,
      },
    ],
    subtotal: 185000000,
    shippingFee: 0,
    total: 185000000,
    status: 'pending',
    paymentMethod: 'bank_transfer',
    createdAt: '2026-01-30T14:20:00Z',
    updatedAt: '2026-01-30T14:20:00Z',
  },
  {
    id: 'order5',
    userId: 'user3',
    orderNumber: 'LJ2026020001',
    customerName: 'Lê Văn C',
    customerEmail: 'le.van.c@email.com',
    customerPhone: '0923456789',
    shippingAddress: '321 Võ Văn Tần, Quận 3, TP. Hồ Chí Minh',
    items: [
      {
        productId: '5',
        productName: 'Nhẫn Ruby Đỏ Thắm',
        productImage: 'luxury ruby ring',
        price: 95000000,
        quantity: 1,
      },
      {
        productId: '8',
        productName: 'Bông Tai Sapphire Xanh',
        productImage: 'luxury sapphire earrings',
        price: 142000000,
        quantity: 1,
      },
    ],
    subtotal: 237000000,
    shippingFee: 0,
    total: 237000000,
    status: 'shipping',
    paymentMethod: 'credit_card',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T15:30:00Z',
  },
];

export const getStatusText = (status: Order['status']): string => {
  const statusMap = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao hàng',
    delivered: 'Đã giao hàng',
    cancelled: 'Đã hủy',
  };
  return statusMap[status];
};

export const getStatusColor = (status: Order['status']): string => {
  const colorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipping: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status];
};

export const getPaymentMethodText = (method: Order['paymentMethod']): string => {
  const methodMap = {
    cod: 'Thanh toán khi nhận hàng (COD)',
    bank_transfer: 'Chuyển khoản ngân hàng',
    credit_card: 'Thẻ tín dụng/ghi nợ',
  };
  return methodMap[method];
};