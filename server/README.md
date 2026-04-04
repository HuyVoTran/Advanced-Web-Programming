# Luxury Jewelry E-Commerce Backend API

A complete, production-ready backend API system for a luxury jewelry e-commerce platform built with Node.js, Express.js, and MongoDB.

## 🎯 Features

### Authentication & Authorization
- User registration and login with JWT tokens
- Password hashing with bcryptjs
- Role-based access control (User/Admin)
- Protected routes with middleware
- Address management for users

### Product Management
- Full product catalog with filtering and search
- Multiple materials and categories
- Brand management
- Featured products showcase
- Related products recommendation
- Pagination support

### Shopping Features
- Shopping cart management
- Order creation for both authenticated users and guests
- Order history and tracking
- Multiple payment statuses (pending, processing, shipping, completed, cancelled)
- Inventory management with stock tracking

### Admin Dashboard
- Complete admin panel with statistics
- Product management (CRUD)
- Order management with status updates
- User management and role assignment
- Category and brand management
- News/Blog management

### Additional Features
- News/Blog system with status management
- Contact form with message storage
- Home page with mock data (banners, collections, stats)
- Comprehensive error handling
- Request validation
- Pagination with customizable limits
- API documentation with Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud - Atlas recommended)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the server directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/luxury_jewelry
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/luxury_jewelry
```

### 4. Seed the Database
```bash
npm run seed
```

This will create:
- 5 luxury brands (Cartier, Tiffany & Co, Chopard, Bvlgari, Van Cleef & Arpels)
- 5 product categories (Rings, Necklaces, Bracelets, Earrings, Watches)
- 10 luxury jewelry products with detailed information
- 3 test users (1 admin + 2 regular users)
- 4 news articles

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run at: `http://localhost:5000`
API Documentation: `http://localhost:5000/api-docs`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 🔑 Test Credentials

After seeding, you can login with:

**Admin Account:**
- Email: `admin@jewelry.com`
- Password: `admin123456`

**User Account:**
- Email: `john@example.com`
- Password: `user123456`

## 📁 Project Structure

```
/server
├── src/
│   ├── app.js                    # Express app configuration
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── env.js                # Environment configuration
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Brand.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── News.js
│   │   └── Contact.js
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── categoryController.js
│   │   ├── brandController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── newsController.js
│   │   ├── contactController.js
│   │   └── adminController.js
│   ├── routes/                   # API endpoints
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── brandRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── newsRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── adminRoutes.js
│   │   └── index.js
│   ├── middlewares/              # Custom middleware
│   │   ├── auth.middleware.js    # JWT authentication
│   │   ├── role.middleware.js    # Authorization
│   │   └── error.middleware.js   # Error handling
│   ├── utils/                    # Utility functions
│   │   ├── jwt.js
│   │   ├── response.js
│   │   ├── validators.js
│   │   └── appError.js
│   ├── seeds/
│   │   └── index.js              # Database seeding
│   └── docs/
│       └── swagger.js            # Swagger configuration
├── server.js                     # Server entry point
├── package.json
├── .env                          # Environment variables
└── .gitignore
```

## 🔌 API Endpoints

### Authentication
```
POST   /auth/register              - Register new user
POST   /auth/login                 - Login user
GET    /auth/profile               - Get user profile (protected)
PUT    /auth/profile               - Update profile (protected)
PUT    /auth/change-password       - Change password (protected)
POST   /auth/addresses             - Add address (protected)
PUT    /auth/addresses/:addressId  - Update address (protected)
DELETE /auth/addresses/:addressId  - Delete address (protected)
```

### Products
```
GET    /products                   - Get all products (with filters)
GET    /products/featured          - Get featured products
GET    /products/stats             - Get product statistics
GET    /products/stock?ids=...     - Get stock snapshot for multiple products
GET    /products/:slug             - Get product by slug
GET    /products/:slug/related     - Get related products
GET    /products/:slug/stock       - Get stock snapshot for one product
```

### Categories
```
GET    /categories                 - Get all categories
GET    /categories/:slug           - Get category by slug
```

### Brands
```
GET    /brands                     - Get all brands
GET    /brands/:slug               - Get brand by slug
```

### Shopping Cart
```
GET    /cart                       - Get user cart (protected)
POST   /cart/add                   - Add product to cart (protected)
PUT    /cart/:itemId               - Update cart item (protected)
DELETE /cart/:itemId               - Remove item from cart (protected)
DELETE /cart                       - Clear cart (protected)
```

### Orders
```
POST   /orders                     - Create order (guest or authenticated)
GET    /orders/my-orders           - Get user orders (protected)
GET    /orders/:id                 - Get order details (protected)
PUT    /orders/:id/cancel          - Cancel order (protected)
```

### News
```
GET    /news                       - Get published news
GET    /news/:slug                 - Get news by slug
```

### Contact
```
POST   /contact                    - Submit contact form
GET    /contact                    - Get contacts (admin only)
GET    /contact/:id                - Get contact details (admin only)
DELETE /contact/:id                - Delete contact (admin only)
```

### Admin Panel
```
GET    /admin/dashboard            - Dashboard statistics (admin only)

Products:
POST   /admin/products             - Create product
GET    /admin/products             - Get all products
PUT    /admin/products/:id         - Update product
DELETE /admin/products/:id         - Soft delete product

Categories:
POST   /admin/categories           - Create category
PUT    /admin/categories/:id       - Update category
DELETE /admin/categories/:id       - Delete category

Brands:
POST   /admin/brands               - Create brand
PUT    /admin/brands/:id           - Update brand
DELETE /admin/brands/:id           - Delete brand

Orders:
GET    /admin/orders               - Get all orders
PUT    /admin/orders/:id/status    - Update order status

Users:
GET    /admin/users                - Get all users
PUT    /admin/users/:id/status     - Toggle user status
PUT    /admin/users/:id/role       - Change user role
DELETE /admin/users/:id            - Delete user

News:
POST   /admin/news                 - Create news
PUT    /admin/news/:id             - Update news
PUT    /admin/news/:id/publish     - Publish news
DELETE /admin/news/:id             - Delete news
```

## 📝 Request/Response Examples

### Register User
**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123456",
  "confirmPassword": "password123456",
  "phone": "0912345678"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login
**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "user123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439010",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "0987654321"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Products with Filters
**Request:**
```bash
GET /api/products?page=1&limit=12&category=507f1f77bcf86cd799439020&minPrice=5000&maxPrice=15000
```

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439030",
      "name": "Cartier Love Bracelet",
      "slug": "cartier-love-bracelet",
      "price": 6350,
      "description": "Iconic 18k rose gold bracelet...",
      "material": "gold",
      "images": ["..."],
      "brand": {...},
      "category": {...},
      "isFeatured": true,
      "stock": 8
    }
  ],
  "pagination": {
    "currentPage": 1,
    "limit": 12,
    "total": 25,
    "totalPages": 3
  }
}
```

### Create Order
**Request:**
```bash
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "customerInfo": {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "0987654321",
    "address": "123 Main Street, City"
  },
  "items": [
    {
      "productId": "507f1f77bcf86cd799439030",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439040",
    "user": null,
    "customerInfo": {...},
    "items": [...],
    "totalPrice": 6350,
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## 🔒 Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ✅ CORS protection
- ✅ Error handling with proper HTTP status codes
- ✅ Protected admin routes
- ✅ User isolation for cart and orders

## 🛠 Technologies Used

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **API Documentation:** Swagger/OpenAPI
- **Validation:** validator.js
- **Development:** nodemon

## 📊 Data Models

### User
- fullName, email, password (hashed), phone
- role (user/admin), isActive
- addresses (array of address objects)
- timestamps

### Product
- name, slug, price, originalPrice, description
- material, images, category, brand
- stock, isFeatured, isActive
- timestamps

### Order
- user (nullable for guest orders)
- customerInfo (fullName, email, phone, address)
- items (array of product references with quantity and price)
- totalPrice, status, notes
- timestamps

### Category & Brand
- name, slug, description
- logo/image, status
- timestamps

### Cart
- user (reference to User)
- items (array of product references with quantity)
- totalPrice (calculated)
- timestamps

### News
- title, slug, thumbnail, content
- author, status (draft/published)
- timestamps

### Contact
- fullName, email, phone, message
- status (new/read/replied)
- timestamps

## 🚨 Error Handling

The API returns standard HTTP status codes:

- `200` - OK (successful request)
- `201` - Created (resource created)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## 📈 Pagination

Products and other list endpoints support pagination:

```bash
GET /api/products?page=1&limit=12
```

Response includes:
```json
{
  "pagination": {
    "currentPage": 1,
    "limit": 12,
    "total": 150,
    "totalPages": 13
  }
}
```

## 🔧 Extending the API

### Adding a New Endpoint

1. **Create a Model** in `/src/models/`
2. **Create a Controller** in `/src/controllers/`
3. **Create Routes** in `/src/routes/`
4. **Register Routes** in `/src/routes/index.js`
5. **Add Middleware** if needed to `/src/middlewares/`

### Example: Adding a Review System

```javascript
// models/Review.js
const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: Number,
  comment: String,
  timestamps: true
});

// controllers/reviewController.js
export const createReview = async (req, res, next) => {
  // Implementation
};

// routes/reviewRoutes.js
router.post('/:productId/reviews', authenticate, createReview);
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in .env
- For Atlas, whitelist your IP address

### JWT Token Errors
- Verify JWT_SECRET is set in .env
- Check token format: "Bearer <token>"
- Ensure token hasn't expired

### Port Already in Use
```bash
# Change PORT in .env or kill process using port 5000
```

## 📞 Support

For questions or issues, please contact: support@luxuryjewelry.com

## 📄 License

ISC License - Feel free to use for educational and commercial projects.

## ✨ Future Enhancements

- [ ] Payment gateway integration (Stripe, PayPal)
- [ ] Email notifications (nodemailer)
- [ ] Image upload (Cloudinary/AWS S3)
- [ ] Search with Elasticsearch
- [ ] Redis caching for products
- [ ] Advanced analytics dashboard
- [ ] Review and rating system
- [ ] Wishlist feature
- [ ] Coupon/Discount codes
- [ ] Inventory alerts
- [ ] Multi-language support
- [ ] Two-factor authentication

---

**Created for Advanced Web Programming Course - Luxury Jewelry E-Commerce Platform**
