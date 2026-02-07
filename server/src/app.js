import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './docs/swagger.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

dotenv.config();

// Khởi tạo ứng dụng Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Kết nối đến MongoDB
connectDB();

// Tài Liệu API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Điểm kiểm tra sức khỏe
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server đang chạy' });
});

// Tuyến đường API
app.use('/api', routes);

// Trình xử lý 404
app.use(notFoundHandler);

// Trình xử lý lỗi (phải ở cuối)
app.use(errorHandler);

export default app;
