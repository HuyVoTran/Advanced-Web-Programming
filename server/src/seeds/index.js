import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Brand from '../models/Brand.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import News from '../models/News.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Kết nối đến cơ sở dữ liệu thành công');

    // Xóa dữ liệu hiện có
    await Brand.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await User.deleteMany({});
    await News.deleteMany({});

    console.log('Đã xóa dữ liệu hiện có');

    // Create Brands
    const brands = await Brand.insertMany([
      {
        name: 'Cartier',
        slug: 'cartier',
        description: 'Thương hiệu xa xỉ người Pháp nổi tiếng vì trang sức và đồng hồ cao cấp',
        logo: '/images/brands/cartier-logo.jpg',
        status: 'active',
      },
      {
        name: 'Tiffany & Co',
        slug: 'tiffany-co',
        description: 'Nhà trang sức xa xỉ Mỹ được thành lập vào năm 1837',
        logo: '/images/brands/tiffany-logo.jpg',
        status: 'active',
      },
      {
        name: 'Chopard',
        slug: 'chopard',
        description: 'Nhà sản xuất đồng hồ và trang sức xa xỉ Thụy Sĩ',
        logo: '/images/brands/chopard-logo.jpg',
        status: 'active',
      },
      {
        name: 'Bvlgari',
        slug: 'bvlgari',
        description: 'Thương hiệu trang sức và thời trang xa xỉ Ý',
        logo: '/images/brands/bvlgari-logo.jpg',
        status: 'active',
      },
      {
        name: 'Van Cleef & Arpels',
        slug: 'van-cleef-arpels',
        description: 'Nhà trang sức Pháp nổi tiếng vì kỹ năng thủ công xuất sắc',
        logo: '/images/brands/van-cleef-logo.jpg',
        status: 'active',
      },
    ]);

    console.log(`✓ Đã tạo ${brands.length} thương hiệu`);

    // Create Categories
    const categories = await Category.insertMany([
      {
        name: 'Rings',
        slug: 'rings',
        description: 'Những chiếc nhẫn đẹp và nhẫn thời trang',
        image: '/images/categories/rings.jpg',
        status: 'active',
      },
      {
        name: 'Necklaces',
        slug: 'necklaces',
        description: 'Vòng cổ và mặt dây chuyền thanh lịch',
        image: '/images/categories/necklaces.jpg',
        status: 'active',
      },
      {
        name: 'Bracelets',
        slug: 'bracelets',
        description: 'Vòng tay và vòng kiềm tuyệt đẹp',
        image: '/images/categories/bracelets.jpg',
        status: 'active',
      },
      {
        name: 'Earrings',
        slug: 'earrings',
        description: 'Bộ sưu tập hoa tai tinh xảo',
        image: '/images/categories/earrings.jpg',
        status: 'active',
      },
      {
        name: 'Watches',
        slug: 'watches',
        description: 'Đồng hồ xa xỉ',
        image: '/images/categories/watches.jpg',
        status: 'active',
      },
    ]);

    console.log(`✓ Đã tạo ${categories.length} danh mục`);

    // Create Products
    const products = await Product.insertMany([
      {
        name: 'Cartier Love Bracelet',
        slug: 'cartier-love-bracelet',
        price: 6350,
        originalPrice: 7500,
        description: 'Chiếc vòng tay vàng hồng 18k mang tính biểu tượng với cơ chế khóa vít. Biểu tượng vĩnh hằng của tình yêu và cam kết.',
        material: 'gold',
        images: ['/images/products/cartier-love-1.jpg', '/images/products/cartier-love-2.jpg'],
        category: categories[2]._id,
        brand: brands[0]._id,
        isFeatured: true,
        stock: 8,
      },
      {
        name: 'Tiffany Diamond Solitaire Ring',
        slug: 'tiffany-diamond-solitaire',
        price: 15000,
        description: 'Nhẫn kim cương solitaire bong bóng tròn cổ điển với khung bạch kim. Kim cương được chứng nhận với độ sáng bật lửa ngoài thường.',
        material: 'platinum',
        images: ['/images/products/tiffany-ring-1.jpg', '/images/products/tiffany-ring-2.jpg'],
        category: categories[0]._id,
        brand: brands[1]._id,
        isFeatured: true,
        stock: 5,
      },
      {
        name: 'Chopard Happy Diamonds Watch',
        slug: 'chopard-happy-diamonds-watch',
        price: 12500,
        description: 'Đồng hồ Thụy Sĩ xa xỉ với các viên kim cương trôi nổi tự do. Thiết kế chống nước và thanh lịch.',
        material: 'diamond',
        images: ['/images/products/chopard-watch-1.jpg', '/images/products/chopard-watch-2.jpg'],
        category: categories[4]._id,
        brand: brands[2]._id,
        isFeatured: true,
        stock: 3,
      },
      {
        name: 'Bvlgari Serpenti Necklace',
        slug: 'bvlgari-serpenti-necklace',
        price: 8900,
        description: 'Dây chuyền có cảm hứng rắn biểu tượng với mắt emerald và điểm nhấn kim cương trên vàng trắng.',
        material: 'gold',
        images: ['/images/products/bvlgari-necklace-1.jpg', '/images/products/bvlgari-necklace-2.jpg'],
        category: categories[1]._id,
        brand: brands[3]._id,
        isFeatured: true,
        stock: 6,
      },
      {
        name: 'Van Cleef Alhambra Bracelet',
        slug: 'van-cleef-alhambra-bracelet',
        price: 7200,
        description: 'Vòng tay năm mặt cài bằng vàng trắng với mẫu đơn. Sự sang trọng và tinh tế vĩnh hằng.',
        material: 'gold',
        images: ['/images/products/van-cleef-bracelet-1.jpg', '/images/products/van-cleef-bracelet-2.jpg'],
        category: categories[2]._id,
        brand: brands[4]._id,
        isFeatured: false,
        stock: 10,
      },
      {
        name: 'Cartier Juste un Clou Earrings',
        slug: 'cartier-juste-un-clou-earrings',
        price: 4200,
        description: 'Hoa tai hiện đại lấy cảm hứng từ đinh tán trong vàng vàng 18k. Thiết kế xa xỉ đương đại.',
        material: 'gold',
        images: ['/images/products/cartier-earrings-1.jpg', '/images/products/cartier-earrings-2.jpg'],
        category: categories[3]._id,
        brand: brands[0]._id,
        isFeatured: false,
        stock: 12,
      },
      {
        name: 'Tiffany Lucida Diamond Ring',
        slug: 'tiffany-lucida-diamond-ring',
        price: 12000,
        description: 'Kim cương hình vuông brilant trong khung bạch kim. Cắt hình học hiện đại để tạo độ sáng tối đa.',
        material: 'diamond',
        images: ['/images/products/tiffany-lucida-1.jpg', '/images/products/tiffany-lucida-2.jpg'],
        category: categories[0]._id,
        brand: brands[1]._id,
        isFeatured: false,
        stock: 4,
      },
      {
        name: 'Chopard Alpine Eagle Watch',
        slug: 'chopard-alpine-eagle-watch',
        price: 14800,
        description: 'Đồng hồ thép không gỉ được sản xuất tại Thụy Sĩ với mặt số thanh lịch và vòng tay thể thao thoải mái.',
        material: 'mixed',
        images: ['/images/products/chopard-alpine-1.jpg', '/images/products/chopard-alpine-2.jpg'],
        category: categories[4]._id,
        brand: brands[2]._id,
        isFeatured: false,
        stock: 2,
      },
      {
        name: 'Bvlgari Divas Dream Necklace',
        slug: 'bvlgari-divas-dream-necklace',
        price: 6500,
        description: 'Mặt dây chuyền hình quạt với kim cương và đá quý. Lấy cảm hứng từ sự thanh lịch của các diva.',
        material: 'gemstone',
        images: ['/images/products/bvlgari-divas-1.jpg', '/images/products/bvlgari-divas-2.jpg'],
        category: categories[1]._id,
        brand: brands[3]._id,
        isFeatured: false,
        stock: 7,
      },
      {
        name: 'Van Cleef Vintage Alhambra Ring',
        slug: 'van-cleef-vintage-alhambra-ring',
        price: 5800,
        description: 'Nhẫn với hoa văn tứ lá cài đặc trưng bằng vàng trắng với trang trí kim cương pavé.',
        material: 'gold',
        images: ['/images/products/van-cleef-ring-1.jpg', '/images/products/van-cleef-ring-2.jpg'],
        category: categories[0]._id,
        brand: brands[4]._id,
        isFeatured: false,
        stock: 9,
      },
    ]);

    console.log(`✓ Đã tạo ${products.length} sản phẩm`);

    // Create Users (including admin)
    const users = await User.insertMany([
      {
        fullName: 'Admin User',
        email: 'admin@jewelry.com',
        password: 'admin123456',
        phone: '0123456789',
        role: 'admin',
        isActive: true,
      },
      {
        fullName: 'John Doe',
        email: 'john@example.com',
        password: 'user123456',
        phone: '0987654321',
        role: 'user',
        isActive: true,
        addresses: [
          {
            fullName: 'John Doe',
            phone: '0987654321',
            address: '123 Main Street, City, Country',
            isDefault: true,
          },
        ],
      },
      {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        password: 'user123456',
        phone: '0912345678',
        role: 'user',
        isActive: true,
        addresses: [
          {
            fullName: 'Jane Smith',
            phone: '0912345678',
            address: '456 Luxury Avenue, City, Country',
            isDefault: true,
          },
        ],
      },
    ]);

    console.log(`✓ Đã tạo ${users.length} người dùng`);

    // Create News
    const news = await News.insertMany([
      {
        title: 'Khôi động Bộ Sưu Tập Xa Xỉ Mới 2024',
        slug: 'new-luxury-collection-2024',
        thumbnail: '/images/news/news-1.jpg',
        content:
          'Chúng tôi rất vui mừng thông báo khôi động bộ sưu tập trang sức xa xỉ độc quyền 2024 của chúng tôi với sự cộng tác của các nhà thiết kế quốc tế nổi tiếng.',
        author: 'Admin',
        status: 'published',
      },
      {
        title: 'Nghệ Thuật Chọn Kim Cương',
        slug: 'art-of-diamond-selection',
        thumbnail: '/images/news/news-2.jpg',
        content:
          'Tìm hiểu về 4C của kim cương: Cắt, Màu sắc, Độ trong sạch và Carat. Hiểu rõ những yếu tố này sẽ giúp bạn chọn kim cương hoàn hảo cho trang sức của mình.',
        author: 'Admin',
        status: 'published',
      },
      {
        title: 'Chăm Sóc Trang Sức Quý Giá Của Bạn',
        slug: 'caring-for-precious-jewelry',
        thumbnail: '/images/news/news-3.jpg',
        content:
          'Mẹo chuyên gia về cách bảo trì và chăm sóc bộ sưu tập trang sức xa xỉ của bạn để đảm bảo nó vẫn đẹp cho các thế hệ tới.',
        author: 'Admin',
        status: 'published',
      },
      {
        title: 'Sự Kiện Xem Trước VIP Sắp Tới',
        slug: 'upcoming-vip-preview',
        thumbnail: '/images/news/news-4.jpg',
        content:
          'Hãy tham gia với chúng tôi để xem trước độc quyền bộ sưu tập mới của chúng tôi. Số lượng chỗ có hạn dành cho khách hàng quý giá của chúng tôi.',
        author: 'Admin',
        status: 'draft',
      },
    ]);

    console.log(`✓ Đã tạo ${news.length} bài viết tin tức`);

    console.log('\n✅ Seeding cơ sở dữ liệu hoàn tất thành công!');
    console.log('\nThông Tin Đăng Nhập Thử Nghiệm:');
    console.log('Email Admin: admin@jewelry.com');
    console.log('Mật khẩu Admin: admin123456');
    console.log('\nEmail Người Dùng: john@example.com');
    console.log('Mật khẩu Người Dùng: user123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seeding cơ sở dữ liệu:', error);
    process.exit(1);
  }
};

seedDatabase();
