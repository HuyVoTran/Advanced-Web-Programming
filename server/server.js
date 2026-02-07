import dotenv from 'dotenv';
import app from './src/app.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📚 Tài Liệu API: http://localhost:${PORT}/api-docs`);
  console.log(`${'═'.repeat(60)}\n`);
});

// Xử lý các promise rejection không xử lý
process.on('unhandledRejection', (err) => {
  console.error('❌ Promise Rejection Chưa Xử Lý:', err);
  server.close(() => process.exit(1));
});

// Xử lý các ngoại lệ không được bắt
process.on('uncaughtException', (err) => {
  console.error('❌ Ngoại Lệ Chưa Được Bắt:', err);
  process.exit(1);
});