import { sendResponse, sendError } from '../utils/response.js';
import path from 'path';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import News from '../models/News.js';

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
    const imagePath = `/images/categories/${req.file.filename}`;

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
    const imagePaths = req.files.map((file) => `/images/products/${file.filename}`);

    // Get current product to handle image updates
    const product = await Product.findById(productId);
    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    let retainedImages = [];
    if (req.body.retainedImages) {
      try {
        const parsed = JSON.parse(req.body.retainedImages);
        retainedImages = Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        retainedImages = [];
      }
    } else {
      retainedImages = Array.isArray(product.images) ? product.images : [];
    }

    const mergedImages = [...retainedImages, ...imagePaths].slice(0, 4);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { images: mergedImages },
      { new: true }
    );

    return sendResponse(res, 200, 'Tải ảnh thành công', {
      files: req.files.map((file) => ({
        filename: file.filename,
        size: file.size,
      })),
      paths: mergedImages,
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handle news thumbnail upload
 */
export const uploadNewsImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Vui lòng chọn ảnh để tải lên');
    }

    const newsId = req.params.id;
    const imagePath = `/images/news/${req.file.filename}`;

    const updatedNews = await News.findByIdAndUpdate(
      newsId,
      { thumbnail: imagePath },
      { new: true }
    );

    if (!updatedNews) {
      return sendError(res, 404, 'Tin tức không tìm thấy');
    }

    return sendResponse(res, 200, 'Tải ảnh thành công', {
      filename: req.file.filename,
      path: imagePath,
      size: req.file.size,
      news: updatedNews,
    });
  } catch (error) {
    next(error);
  }
};
