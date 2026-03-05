import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Resolve to project root: middlewares -> src -> server -> project root
const rootDir = path.resolve(__dirname, '../../../');

/**
 * Setup storage for category images
 */
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(rootDir, 'client/public/images/categories');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save as {id}.{ext}
    const categoryId = req.params.id || 'new';
    const ext = path.extname(file.originalname);
    cb(null, `${categoryId}${ext}`);
  },
});

/**
 * Setup storage for product images
 */
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(rootDir, 'client/public/images/products');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save as {id}-{index}.{ext}
    const productId = req.params.id || 'new';
    const fileIndex = req.fileIndex || 0;
    const ext = path.extname(file.originalname);
    cb(null, `${productId}-${fileIndex}${ext}`);
    req.fileIndex = (req.fileIndex || 0) + 1;
  },
});

/**
 * File filter - only allow images
 */
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)'));
  }
};

/**
 * Multer instances
 */
export const uploadCategory = multer({
  storage: categoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadProduct = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});
