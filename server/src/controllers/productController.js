import Product from '../models/Product.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, brand, minPrice, maxPrice, search } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    // Xây dựng đối tượng filter
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = brand;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('category')
      .populate('brand')
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Sản phẩm được lấy thành công',
      products,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({ slug, isActive: true })
      .populate('category')
      .populate('brand');

    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    return sendResponse(res, 200, 'Sản phẩm được lấy thành công', product);
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;

    const products = await Product.find({ isActive: true, isFeatured: true })
      .populate('category')
      .populate('brand')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Sản phẩm nổi bật được lấy thành công', products);
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { limit = 4 } = req.query;

    const product = await Product.findOne({ slug });

    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    })
      .populate('category')
      .populate('brand')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Sản phẩm liên quan được lấy thành công', relatedProducts);
  } catch (error) {
    next(error);
  }
};

export const getProductStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ isActive: true, isFeatured: true });
    const lowStockProducts = await Product.countDocuments({ isActive: true, stock: { $lt: 10 } });

    return sendResponse(res, 200, 'Thống kê sản phẩm được lấy thành công', {
      totalProducts,
      featuredProducts,
      lowStockProducts,
    });
  } catch (error) {
    next(error);
  }
};
