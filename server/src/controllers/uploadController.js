import { sendResponse, sendError } from '../utils/response.js';
import path from 'path';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

/**
 * Handle category image upload
 */
export const uploadCategoryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Vui lòng chọn ảnh để tải lên');
    }

    const categoryId = req.params.id;

    // Construct relative path for database storage
    const imagePath = `/client/public/images/categories/${req.file.filename}`;

    // Update category with new image path
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { image: imagePath },
      { new: true }
    );

    if (!updatedCategory) {
      return sendError(res, 404, 'Danh mục không tìm thấy');
    }

    return sendResponse(res, 200, 'Tải ảnh thành công', {
      filename: req.file.filename,
      path: imagePath,
      size: req.file.size,
      category: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle product image upload (max 4 images)
 */
export const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 400, 'Vui lòng chọn ít nhất một ảnh để tải lên');
    }

    if (req.files.length > 4) {
      return sendError(res, 400, 'Tối đa 4 ảnh cho một sản phẩm');
    }

    const productId = req.params.id;

    // Construct relative paths for database storage
    const imagePaths = req.files.map((file) => `/client/public/images/products/${file.filename}`);

    // Get current product to handle image updates
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    // Update images array - if it's a new upload session, replace; otherwise append
    // For simplicity, we replace all images with new ones (as per typical upload behavior)
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { images: imagePaths },
      { new: true }
    );

    return sendResponse(res, 200, 'Tải ảnh thành công', {
      files: req.files.map((file) => ({
        filename: file.filename,
        size: file.size,
      })),
      paths: imagePaths,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};
