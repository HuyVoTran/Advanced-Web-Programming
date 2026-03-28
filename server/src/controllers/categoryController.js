import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { sendResponse, sendError } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ status: 'active' }).sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Danh mục được lấy thành công', categories);
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug, status: 'active' });

    if (!category) {
      return sendError(res, 404, 'Danh mục không tìm thấy');
    }

    return sendResponse(res, 200, 'Danh mục được lấy thành công', category);
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;

    if (!name) {
      return sendError(res, 400, 'Vui lòng cung cấp tên danh mục');
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return sendError(res, 409, 'Danh mục đã tồn tại');
    }

    const category = new Category({
      name,
      description,
      image,
    });

    await category.save();

    return sendResponse(res, 201, 'Danh mục được tạo thành công', category);
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, status } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, image, status },
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 404, 'Danh mục không tìm thấy');
    }

    return sendResponse(res, 200, 'Danh mục được cập nhật thành công', category);
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return sendError(res, 404, 'Danh mục không tìm thấy');
    }

    // Xóa toàn bộ sản phẩm thuộc danh mục này
    await Product.deleteMany({ category: id });

    return sendResponse(res, 200, 'Danh mục và toàn bộ sản phẩm thuộc danh mục đã được xóa thành công');
  } catch (error) {
    next(error);
  }
};
