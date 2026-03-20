<!-- 

git add .
git commit -m "Update features"
git push 

cd server
npm start

cd client
npm run dev

-->

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
- 📰 Trang tin tức/blog (Masonry layout)
- 🧭 Trang danh mục/brands/legal
- 📩 Form liên hệ gửi đến admin

### Admin Features
- 📊 Dashboard tổng quan với biểu đồ
- 📦 Quản lý sản phẩm (CRUD)
- 📁 Quản lý danh mục
- 🚚 Quản lý đơn hàng và cập nhật trạng thái
- 👥 Quản lý người dùng và phân quyền
- 📰 Quản lý tin tức (CRUD + publish)
- 📣 Gửi thông báo newsletter
- 📬 Quản lý liên hệ từ khách hàng

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

### Backend
- **Express** - Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email
- **Multer** - Upload

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
│   │       ├── AdminNews.tsx
│   │       ├── AdminNewsletter.tsx
│   │       └── AdminContacts.tsx
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
- `/categories` - Danh mục
- `/brands` - Thương hiệu
- `/blog` - Tin tức
- `/legal/terms` - Điều khoản
- `/legal/privacy` - Chính sách
- `/legal/return` - Đổi trả
- `/legal/shipping` - Vận chuyển

### User Routes (Cần đăng nhập)
## 🚀 Quy Trình Thanh Toán (COD Flow)

### User Side
1. **Tạo tài khoản**: User đăng ký hoặc tiếp tục là guest
2. **Thêm vào giỏ hàng**: Chọn sản phẩm, điều chỉnh số lượng
3. **Thanh toán**: 
   - Điền form thông tin giao hàng (tên, số điện thoại, địa chỉ...)
   - Chọn phương thức: **COD (Thanh toán khi nhận hàng)**
   - Nhấn "Đặt hàng" → Đơn hàng được tạo với trạng thái **pending**
4. **Chờ xác nhận**: Hiển thị trang "Đặt hàng thành công" với thông báo chờ admin xác nhận trong 24h
5. **Nhận email**: Nhận email xác nhận đơn hàng
6. **Theo dõi**: Xem trạng thái đơn hàng trong `/orders`

### Admin Side
1. **Xem danh sách**: Admin vào `/admin/orders` xem tất cả đơn hàng
2. **Xem chi tiết**: Click để xem đơn hàng ở trạng thái **pending**
3. **Phê duyệt hoặc Từ chối**:
   - **Phê duyệt**: Nhấn nút "Phê duyệt đơn hàng" → Status chuyển thành **confirmed**
   - **Từ chối**: Nhấn "Từ chối", nhập lý do → Status chuyển thành **cancelled**, kho hàng được khôi phục
4. **Cập nhật trạng thái**:
   - **confirmed** → **shipping** (đang giao hàng)
   - **shipping** → **completed** (đã giao hàng)

### Status Flow
```
pending (chờ xác nhận) 
  ├─→ confirmed (admin phê duyệt)
  │    ├─→ shipping (đang giao)
  │    └─→ completed (đã giao)
  └─→ cancelled (admin từ chối, user hủy)
```

## 🚀 Routes

### Public Routes
- `/` - Trang chủ
- `/products` - Danh sách sản phẩm
- `/product/:id` - Chi tiết sản phẩm
- `/cart` - Giỏ hàng
- `/checkout` - Thanh toán (COD)
- `/order-success/:orderId` - Xác nhận đặt hàng
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu
- `/reset-password` - Đặt lại mật khẩu
- `/about` - Giới thiệu
- `/contact` - Liên hệ
- `/categories` - Danh mục
- `/brands` - Thương hiệu
- `/blog` - Tin tức
- `/legal/terms` - Điều khoản
- `/legal/privacy` - Chính sách
- `/legal/return` - Đổi trả
- `/legal/shipping` - Vận chuyển

### User Routes (Cần đăng nhập)
- `/dashboard` - Dashboard người dùng
- `/profile` - Thông tin cá nhân
- `/addresses` - Sổ địa chỉ
- `/settings` - Cài đặt
- `/orders` - Lịch sử đơn hàng
- `/order-success/:orderId` - Xác nhận đơn hàng

### Admin Routes
- `/admin` - Dashboard Admin
- `/admin/products` - Quản lý sản phẩm
- `/admin/products/new` - Thêm sản phẩm
- `/admin/products/:id` - Thêm/Sửa sản phẩm
- `/admin/categories` - Quản lý danh mục
- `/admin/orders` - Quản lý đơn hàng (COD approval)
- `/admin/orders/:id` - Chi tiết đơn hàng + approve/reject
- `/admin/users` - Quản lý người dùng
- `/admin/news` - Quản lý tin tức
- `/admin/newsletter` - Gửi newsletter
- `/admin/contacts` - Quản lý liên hệ

## 📊 Dữ Liệu

- Backend Express trong thư mục `/server` xử lý dữ liệu thật.
- Mock data cũ vẫn có trong `/src/data/mockData.ts` (phục vụ demo UI khi cần).

## 🎯 Điểm Nổi Bật

1. **UI/UX Chất Lượng Cao**: Thiết kế luxury theo chuẩn thương hiệu cao cấp
2. **Responsive Design**: Hoạt động mượt mà trên mọi thiết bị
3. **Component-Based**: Dễ maintain và scale
4. **Type-Safe**: TypeScript cho toàn bộ dự án
5. **Best Practices**: Clean code, folder structure rõ ràng
6. **Backend sẵn sàng**: Express + MongoDB đã tích hợp

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

## 📝 Ghi chú Kỹ Thuật

### Payment & Order Management
- **COD (Cash on Delivery)**: Hỗ trợ thanh toán khi nhận hàng
- **Order Status Flow**: pending → confirmed → shipping → completed
- **Admin Approval**: Admin phải phê duyệt đơn hàng trước khi chuyển sang shipping
- **Order Rejection**: Admin có thể từ chối đơn hàng và tự động khôi phục kho hàng
- **JWT Authentication**: Token-based auth với 24h refresh

### Backend Integration
- **Express.js** trong `/server` xử lý API
- **MongoDB** lưu trữ dữ liệu
- **Nodemailer** gửi email xác nhận đơn hàng
- **Multer** xử lý upload file
- **CORS** cho cross-origin requests

### Frontend Architecture
- **Context API**: AuthContext, CartContext, OrderContext
- **Custom Hooks**: useCustomHooks cho reusable logic
- **React Router**: Client-side routing
- **Tailwind CSS v4**: Styling
- **Sonner**: Toast notifications
- **Type-safe**: Toàn bộ TypeScript

## 🎓 Dành Cho Đồ Án Sinh Viên

Dự án này được thiết kế đặc biệt cho đồ án sinh viên với:
- ✅ Đầy đủ tính năng e-commerce thực tế (COD payment flow hoàn chỉnh)
- ✅ Code structure chuyên nghiệp
- ✅ UI/UX đẹp, sang trọng
- ✅ Dễ demo và trình bày
- ✅ Dễ mở rộng và tích hợp backend
- ✅ Admin panel đầy đủ để quản lý đơn hàng

---

**Developed with ❤️ for Academic Project**
