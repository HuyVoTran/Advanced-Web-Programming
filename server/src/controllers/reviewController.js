import Order from '../models/Order.js';
import Product from '../models/Product.js';
import ProductReview from '../models/ProductReview.js';
import { sendResponse, sendError } from '../utils/response.js';
import { createNotification } from '../utils/notification.js';

const resolveProductByParam = async (slugOrId) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);

  if (isObjectId) {
    return Product.findById(slugOrId);
  }

  return Product.findOne({ slug: slugOrId, isActive: true });
};

export const getProductReviews = async (req, res, next) => {
  try {
    const product = await resolveProductByParam(req.params.slug);
    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    const reviews = await ProductReview.find({ product: product._id })
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Đánh giá sản phẩm được lấy thành công', {
      reviews,
      total: reviews.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createProductReview = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập để đánh giá sản phẩm');
    }

    const product = await resolveProductByParam(req.params.slug);
    if (!product) {
      return sendError(res, 404, 'Sản phẩm không tìm thấy');
    }

    const content = String(req.body?.content || '').trim();
    if (content.length < 10) {
      return sendError(res, 400, 'Nội dung đánh giá cần tối thiểu 10 ký tự');
    }

    const completedOrder = await Order.findOne({
      user: req.user.id,
      status: 'completed',
      'items.product': product._id,
    }).sort({ createdAt: -1 });

    if (!completedOrder) {
      return sendError(res, 400, 'Bạn chỉ có thể đánh giá sản phẩm đã mua và hoàn thành');
    }

    const review = await ProductReview.findOneAndUpdate(
      { product: product._id, user: req.user.id },
      {
        product: product._id,
        user: req.user.id,
        order: completedOrder._id,
        content,
        isVerifiedPurchase: true,
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate('user', 'fullName');

    await createNotification({
      userId: req.user.id,
      type: 'review',
      title: 'Đánh giá đã được lưu',
      message: `Cảm ơn bạn đã chia sẻ trải nghiệm với sản phẩm ${product.name}.`,
      link: `/product/${product.slug || product._id}`,
      metadata: { productId: String(product._id), reviewId: String(review._id) },
    });

    return sendResponse(res, 201, 'Đánh giá sản phẩm thành công', review);
  } catch (error) {
    next(error);
  }
};