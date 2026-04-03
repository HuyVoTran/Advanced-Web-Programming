<!-- 

git add .
git commit -m "Update"
git push 

cd server
npm start

cd client
npm run dev 

-->
# SALVIO ROYALE

## 1. Giới thiệu

### 1.1 Tên đề tài
Hệ thống thương mại điện tử trang sức cao cấp SALVIO ROYALE.

### 1.2 Bối cảnh
Dự án được xây dựng theo định hướng đồ án học thuật trong lĩnh vực phát triển ứng dụng web full-stack. Hệ thống mô phỏng quy trình vận hành của một website thương mại điện tử thực tế, bao gồm quản lý sản phẩm, đặt hàng, theo dõi đơn hàng, quản trị nội dung và vận hành quản trị viên.

### 1.3 Mục tiêu của tác giả
Mục tiêu chính của tác giả khi thực hiện hệ thống này:
- Xây dựng một kiến trúc full-stack rõ ràng, có khả năng mở rộng.
- Áp dụng quy trình phát triển phần mềm từ phân tích yêu cầu đến triển khai tính năng.
- Rèn luyện năng lực thiết kế cơ sở dữ liệu, API REST, xác thực người dùng và quản trị hệ thống.
- Hoàn thiện một sản phẩm có thể trình bày học thuật và demo nghiệp vụ thực tế.

## 2. Mục tiêu và phạm vi nghiên cứu

### 2.1 Mục tiêu kỹ thuật
- Thiết kế frontend hiện đại, responsive, tách lớp component rõ ràng.
- Xây dựng backend Express.js theo mô hình controller-route-model.
- Lưu trữ dữ liệu bằng MongoDB, hỗ trợ nghiệp vụ người dùng và quản trị.
- Tích hợp xác thực JWT và phân quyền user/admin.
- Triển khai luồng đặt hàng và quản lý trạng thái đơn hàng theo quy trình.

### 2.2 Phạm vi chức năng
Hệ thống tập trung vào nghiệp vụ cốt lõi của thương mại điện tử:
- Quản lý danh mục, thương hiệu, sản phẩm.
- Giỏ hàng, thanh toán COD, lịch sử đơn hàng.
- Quản lý địa chỉ giao hàng và thông tin tài khoản.
- Quản trị đơn hàng, người dùng, tin tức, liên hệ và newsletter.

Không nằm trong phạm vi hiện tại:
- Tích hợp cổng thanh toán trực tuyến thực tế.
- Tối ưu hạ tầng production quy mô lớn (microservices, CI/CD nâng cao, autoscaling).

## 3. Kiến trúc hệ thống

### 3.1 Kiến trúc tổng quan
- Frontend: React + TypeScript, chạy theo mô hình SPA.
- Backend: Express.js cung cấp REST API.
- Database: MongoDB với Mongoose ODM.
- Authentication: JWT bearer token.

### 3.2 Cấu trúc thư mục chính
- `client/`: mã nguồn giao diện người dùng.
- `server/`: mã nguồn API, model dữ liệu và nghiệp vụ backend.

## 4. Công nghệ sử dụng

### 4.1 Frontend
- React 18
- TypeScript
- React Router
- Tailwind CSS
- Context API
- Sonner (toast)
- Date-fns
- Recharts
- React Slick

### 4.2 Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Multer
- Nodemailer

## 5. Chức năng hệ thống

### 5.1 Chức năng người dùng
- Đăng ký, đăng nhập, quên mật khẩu, đặt lại mật khẩu.
- Xem sản phẩm, lọc/sắp xếp/tìm kiếm, xem chi tiết.
- Quản lý giỏ hàng, cập nhật số lượng, xóa sản phẩm.
- Thanh toán theo hình thức COD.
- Theo dõi lịch sử đơn hàng và chi tiết đơn hàng.
- Hủy đơn hàng ở trạng thái `pending`/`confirmed` với form nhập lý do hủy.
- Cập nhật hồ sơ cá nhân.
- Quản lý sổ địa chỉ (thêm, sửa, xóa, đặt mặc định).
- Cập nhật cài đặt tài khoản (notifications, ngôn ngữ, múi giờ, tiền tệ).
- Xem tin tức, danh mục, thương hiệu, chính sách.
- Header promotion dạng carousel 1 dòng, tự động chuyển, có nút tắt và nút hiện lại ở footer.

### 5.2 Chức năng quản trị viên
- Dashboard tổng quan.
- Quản lý sản phẩm (CRUD) và ảnh sản phẩm.
- Quản lý danh mục và ảnh danh mục.
- Quản lý đơn hàng và cập nhật trạng thái.
- Xuất thống kê đơn hàng PDF, xuất danh sách hóa đơn PDF.
- Xuất hóa đơn chi tiết PDF tại trang chi tiết đơn hàng.
- Quản lý người dùng và vai trò.
- Quản lý tin tức (CRUD, publish, thumbnail).
- Gửi newsletter.
- Quản lý liên hệ từ người dùng.

## 6. Luồng nghiệp vụ đơn hàng

### 6.1 Luồng người dùng
1. Người dùng thêm sản phẩm vào giỏ hàng.
2. Người dùng nhập thông tin nhận hàng tại trang checkout.
3. Hệ thống tạo đơn hàng với trạng thái ban đầu `pending`.
4. Người dùng theo dõi tiến trình tại trang lịch sử đơn hàng.

### 6.2 Luồng quản trị
1. Quản trị viên nhận đơn hàng ở trạng thái `pending`.
2. Cập nhật sang `confirmed` khi phê duyệt.
3. Cập nhật sang `shipping` khi đang giao.
4. Cập nhật sang `completed` khi giao thành công.
5. Có thể chuyển sang `cancelled` nếu từ chối/hủy đơn phù hợp nghiệp vụ.

## 7. Các route chính

### 7.1 Public routes
- `/`
- `/products`
- `/product/:id`
- `/cart`
- `/checkout`
- `/order-success/:orderId`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/about`
- `/contact`
- `/categories`
- `/brands`
- `/blog`
- `/blog/:slug`
- `/legal/terms`
- `/legal/privacy`
- `/legal/return`
- `/legal/shipping`

### 7.2 User routes
- `/dashboard`
- `/profile`
- `/addresses`
- `/settings`
- `/orders`
- `/orders/:id`

### 7.3 Admin routes
- `/admin`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id`
- `/admin/categories`
- `/admin/orders`
- `/admin/orders/:id`
- `/admin/users`
- `/admin/news`
- `/admin/newsletter`
- `/admin/contacts`

## 8. Cài đặt và chạy dự án

### 8.1 Yêu cầu môi trường
- Node.js LTS
- npm
- MongoDB

### 8.2 Cài đặt backend
```powershell
cd server
npm install
npm start
```

### 8.3 Cài đặt frontend
```powershell
cd client
npm install
npm run dev
```

### 8.4 Build frontend
```powershell
cd client
npm run build
```

### 8.5 Biến môi trường backend khuyến nghị
Để các chức năng email đơn hàng hoạt động đầy đủ (đặt hàng thành công, đã xác nhận, đã hủy), cấu hình thêm trong backend:

```env
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_app_password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000
EMAIL_LOGO_URL=https://your-public-logo-url
```

Ghi chú:
- `CLIENT_URL` dùng để tạo link trong email (xem đơn, mở form hủy).
- `EMAIL_LOGO_URL` nên là URL public để email client hiển thị logo ổn định.

## 9. Trạng thái kiểm thử smoke (user flow)

Vòng smoke checklist nhanh cho luồng:
- `profile`
- `addresses CRUD`
- `checkout`
- `orders`
- `settings`

Kết quả kiểm tra kỹ thuật đã thực hiện:
- Frontend build thành công (`vite build`).
- Kiểm tra syntax backend thành công cho các file `auth`, `order`, `User model`, `Order model`, `authRoutes`, `orderRoutes`.
- Route người dùng trong `App.tsx` đã map đầy đủ cho các trang thuộc luồng trên.

Lưu ý:
- Để xác nhận đầy đủ end-to-end ở mức runtime, cần chạy đồng thời frontend + backend + MongoDB, sau đó thao tác trực tiếp trên trình duyệt với tài khoản test.

## 10. Định hướng mở rộng
- Tích hợp cổng thanh toán trực tuyến thực tế.
- Bổ sung test tự động (unit/integration/e2e).
- Hoàn thiện logging, audit và monitoring cho môi trường production.
- Tối ưu hiệu năng truy vấn và tách service khi mở rộng quy mô.

## 11. Kết luận
Dự án SALVIO ROYALE đáp ứng mục tiêu xây dựng một hệ thống thương mại điện tử học thuật có tính ứng dụng thực tế, với đầy đủ thành phần từ frontend, backend, cơ sở dữ liệu đến các quy trình nghiệp vụ chính. Hệ thống hiện phù hợp cho mục đích báo cáo đồ án, demo chức năng và tiếp tục mở rộng trong các giai đoạn phát triển tiếp theo.
