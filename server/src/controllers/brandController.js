import Brand from '../models/Brand.js';
import { sendResponse, sendError } from '../utils/response.js';

export const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find({ status: 'active' }).sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Thương hiệu được lấy thành công', brands);
  } catch (error) {
    next(error);
  }
};

export const getBrandBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const brand = await Brand.findOne({ slug, status: 'active' });

    if (!brand) {
      return sendError(res, 404, 'Thương hiệu không tìm thấy');
    }

    return sendResponse(res, 200, 'Thương hiệu được lấy thành công', brand);
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name, description, logo } = req.body;

    if (!name) {
      return sendError(res, 400, 'Vui lòng cung cấp tên thương hiệu');
    }

    const existingBrand = await Brand.findOne({ name });
    if (existingBrand) {
      return sendError(res, 409, 'Thương hiệu đã tồn tại');
    }

    const brand = new Brand({
      name,
      description,
      logo,
    });

    await brand.save();

    return sendResponse(res, 201, 'Thương hiệu được tạo thành công', brand);
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logo, status } = req.body;

    const brand = await Brand.findByIdAndUpdate(
      id,
      { name, description, logo, status },
      { new: true, runValidators: true }
    );

    if (!brand) {
      return sendError(res, 404, 'Thương hiệu không tìm thấy');
    }

    return sendResponse(res, 200, 'Thương hiệu được cập nhật thành công', brand);
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findByIdAndDelete(id);

    if (!brand) {
      return sendError(res, 404, 'Thương hiệu không tìm thấy');
    }

    return sendResponse(res, 200, 'Thương hiệu được xóa thành công');
  } catch (error) {
    next(error);
  }
};
