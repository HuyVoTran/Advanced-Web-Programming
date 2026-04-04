import Product from '../models/Product.js';
import ProductReview from '../models/ProductReview.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';

export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, brand, minPrice, maxPrice, search, sale } = req.query;
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

    if (sale === 'true' || sale === '1') {
      filter.salePercent = { $gt: 0 };
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

    let product;
    
    // Check if slug is a valid MongoDB ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    // Debug log to help trace 404 issues in development
    // eslint-disable-next-line no-console
    console.debug('[getProductBySlug] param:', slug, 'isObjectId:', isObjectId);

    if (isObjectId) {
      // Try to find by ID first
      product = await Product.findById(slug)
        .populate('category')
        .populate('brand');

      // If not found by ID, it's possible the frontend sent a value
      // that looks like an ObjectId but is actually a slug stored as a
      // string in the slug field. Try a fallback search by slug.
      if (!product) {
        // eslint-disable-next-line no-console
        console.debug('[getProductBySlug] not found by ID, trying slug fallback');
        product = await Product.findOne({ slug, isActive: true })
          .populate('category')
          .populate('brand');
      }
    } else {
      // Find by slug
      product = await Product.findOne({ slug, isActive: true })
        .populate('category')
        .populate('brand');
    }

    // eslint-disable-next-line no-console
    console.debug('[getProductBySlug] found:', !!product, product?._id);

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

    // debug logging
    // eslint-disable-next-line no-console
    console.debug('[getRelatedProducts] param:', slug);
    let product;
    // support being called with either slug or ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    // eslint-disable-next-line no-console
    console.debug('[getRelatedProducts] isObjectId:', isObjectId);
    if (isObjectId) {
      product = await Product.findById(slug);
      if (!product) {
        // if not found by id, maybe the param is actually a slug that
        // happens to look like an ObjectId
        product = await Product.findOne({ slug });
      }
    } else {
      product = await Product.findOne({ slug });
    }

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

export const getSearchSuggestions = async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();

    if (query.length < 2) {
      return sendResponse(res, 200, 'Gợi ý tìm kiếm được lấy thành công', []);
    }

    const pattern = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const products = await Product.find({
      isActive: true,
      $or: [
        { name: pattern },
        { description: pattern },
        { material: pattern },
      ],
    })
      .limit(8)
      .sort({ isFeatured: -1, createdAt: -1 });

    const suggestions = products.map((product) => ({
      _id: product._id,
      name: product.name,
      slug: product.slug,
      image: product.images?.[0] || '',
      price: product.price,
      material: product.material,
      brandName: typeof product.brand === 'object' ? product.brand?.name || '' : '',
    }));

    return sendResponse(res, 200, 'Gợi ý tìm kiếm được lấy thành công', suggestions);
  } catch (error) {
    next(error);
  }
};

export const getProductStockBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);

    const query = isObjectId ? { _id: slug } : { slug };
    const product = await Product.findOne(query).select('_id name stock isActive updatedAt');

    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    return sendResponse(res, 200, 'Tồn kho sản phẩm được lấy thành công', {
      productId: String(product._id),
      name: product.name,
      stock: Number(product.stock || 0),
      isActive: Boolean(product.isActive),
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductsStock = async (req, res, next) => {
  try {
    const rawIds = String(req.query.ids || '').trim();
    const ids = rawIds
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean)
      .filter((id) => /^[0-9a-fA-F]{24}$/.test(id));

    if (ids.length === 0) {
      return sendResponse(res, 200, 'Tồn kho sản phẩm được lấy thành công', []);
    }

    const products = await Product.find({ _id: { $in: ids } })
      .select('_id name stock isActive updatedAt')
      .lean();

    const stockById = new Map(
      products.map((product) => [String(product._id), {
        productId: String(product._id),
        name: product.name,
        stock: Number(product.stock || 0),
        isActive: Boolean(product.isActive),
        updatedAt: product.updatedAt,
      }])
    );

    const orderedStocks = ids.map((productId) => (
      stockById.get(productId) || {
        productId,
        name: '',
        stock: 0,
        isActive: false,
        updatedAt: null,
      }
    ));

    return sendResponse(res, 200, 'Tồn kho sản phẩm được lấy thành công', orderedStocks);
  } catch (error) {
    next(error);
  }
};

export const getProductReviewSummary = async (productId) => {
  const totalReviews = await ProductReview.countDocuments({ product: productId });
  return { totalReviews };
};
