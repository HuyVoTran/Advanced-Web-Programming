# SALVIO ROYALE - Hệ Thống Thương Mại Điện Tử Trang Sức Cao Cấp

Website thương mại điện tử bán trang sức cao cấp với phong cách luxury - sang trọng - tinh tế.

## 🌟 Tính Năng

### User Features
- ✨ Trang chủ với Hero Carousel tự động
- 🛍️ Danh sách sản phẩm với filter, sort, pagination
- 🔍 Chi tiết sản phẩm với gallery ảnh
- 🛒 Giỏ hàng với update số lượng
- 💳 Thanh toán (hỗ trợ cả user đăng nhập và guest)
- 📦 Lịch sử đơn hàng và theo dõi trạng thái
- 👤 Dashboard cá nhân
- 📍 Quản lý địa chỉ giao hàng
- ⚙️ Cài đặt tài khoản

### Admin Features
- 📊 Dashboard tổng quan với biểu đồ
- 📦 Quản lý sản phẩm (CRUD)
- 📁 Quản lý danh mục
- 🚚 Quản lý đơn hàng và cập nhật trạng thái
- 👥 Quản lý người dùng và phân quyền

## 🎨 Thiết Kế

- **Font**: Montserrat (Google Fonts)
- **Màu sắc chính**: 
  - Gold: #C9A24D
  - White: #FFFFFF
  - Black/Dark Gray
- **Framework**: React + Tailwind CSS v4
- **Responsive**: Desktop-first với mobile support

## 🛠️ Công Nghệ

### Frontend
- **React 18.3.1** - UI Library
- **React Router** - Routing
- **Context API** - State Management
- **Tailwind CSS v4** - Styling
- **Lucide React** - Icons
- **Recharts** - Charts & Graphs
- **Date-fns** - Date formatting
- **Sonner** - Toast notifications
- **React Slick** - Carousel

### Kiến Trúc Backend (Mô phỏng)
- **NestJS** - Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication

## 📂 Cấu Trúc Dự Án

```
src/
├── app/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── HeroCarousel.tsx
│   │   └── ui/ (shadcn components)
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── OrderSuccess.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── ForgotPassword.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── UserProfile.tsx
│   │   ├── AddressManagement.tsx
│   │   ├── UserSettings.tsx
│   │   ├── OrderHistory.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminProducts.tsx
│   │       ├── AdminProductForm.tsx
│   │       ├── AdminCategories.tsx
│   │       ├── AdminOrders.tsx
│   │       ├── AdminOrderDetail.tsx
│   │       ├── AdminUsers.tsx
│   │       └── AdminLogin.tsx
│   └── App.tsx
├── contexts/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   └── OrderContext.tsx
├── data/
│   └── mockData.ts (Mock database)
└── styles/
    ├── fonts.css
    ├── theme.css
    └── index.css
```

## 🚀 Routes

### Public Routes
- `/` - Trang chủ
- `/products` - Danh sách sản phẩm
- `/product/:id` - Chi tiết sản phẩm
- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu
- `/about` - Giới thiệu
- `/contact` - Liên hệ

### User Routes (Cần đăng nhập)
- `/dashboard` - Dashboard người dùng
- `/profile` - Thông tin cá nhân
- `/addresses` - Sổ địa chỉ
- `/settings` - Cài đặt
- `/orders` - Lịch sử đơn hàng
- `/order-success/:orderId` - Xác nhận đơn hàng

### Admin Routes
- `/admin/login` - Đăng nhập Admin
- `/admin` - Dashboard Admin
- `/admin/products` - Quản lý sản phẩm
- `/admin/products/:id` - Thêm/Sửa sản phẩm
- `/admin/categories` - Quản lý danh mục
- `/admin/orders` - Quản lý đơn hàng
- `/admin/orders/:id` - Chi tiết đơn hàng
- `/admin/users` - Quản lý người dùng

## 📊 Mock Data

Dự án sử dụng mock data trong `/src/data/mockData.ts` bao gồm:
- 12 sản phẩm trang sức cao cấp
- 4 danh mục chính
- 5 thương hiệu
- 4 người dùng (bao gồm admin)
- 5 đơn hàng mẫu
- Blog posts

## 🎯 Điểm Nổi Bật

1. **UI/UX Chất Lượng Cao**: Thiết kế luxury theo chuẩn thương hiệu cao cấp
2. **Responsive Design**: Hoạt động mượt mà trên mọi thiết bị
3. **Component-Based**: Dễ maintain và scale
4. **Type-Safe**: TypeScript cho toàn bộ dự án
5. **Best Practices**: Clean code, folder structure rõ ràng
6. **Ready for Backend**: Dễ dàng tích hợp với NestJS backend

## 🔐 Demo Accounts

Demo accounts and credentials have been removed from this repository. Use real backend credentials or create accounts via the registration flow when integrating with a backend.

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Color Palette

```css
--gold: #C9A24D;
--gold-dark: #B8923D;
--white: #FFFFFF;
--black: #1A1A1A;
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
```

## ⚡ Performance

- Lazy loading images
- Optimized bundle size
- Smooth animations với Motion
- Fast page transitions

## 🔧 Customization

Dễ dàng tùy chỉnh:
- Màu sắc trong `/src/styles/theme.css`
- Typography trong `/src/styles/index.css`
- Components trong `/src/app/components/`

## 📝 Notes

- Đây là frontend mockup với mock data
- Để triển khai production, cần tích hợp với backend NestJS thật
- MongoDB schema đã được thiết kế sẵn trong interfaces
- JWT authentication flow đã được mô phỏng

## 🎓 Dành Cho Đồ Án Sinh Viên

Dự án này được thiết kế đặc biệt cho đồ án sinh viên với:
- ✅ Đầy đủ tính năng e-commerce thực tế
- ✅ Code structure chuyên nghiệp
- ✅ UI/UX đẹp, sang trọng
- ✅ Dễ demo và trình bày
- ✅ Dễ mở rộng và tích hợp backend

---

**Developed with ❤️ for Academic Project**
