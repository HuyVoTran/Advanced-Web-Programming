import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';
import { sendResponse, sendError } from '../utils/response.js';
import { validateEmail, validatePassword } from '../utils/validators.js';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword, phone } = req.body;

    // Kiểm tra thông tin
    if (!fullName || !email || !password) {
      return sendError(res, 400, 'Vui lòng cung cấp tất cả các trường bắt buộc');
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Vui lòng cung cấp email hợp lệ');
    }

    if (!validatePassword(password)) {
      return sendError(res, 400, 'Mật khẩu phải ít nhất 6 ký tự');
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Mật khẩu không khớp');
    }

    // Kiểm tra người dùng đã tồn tại
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 409, 'Email đã được đăng ký');
    }

    // Tạo người dùng mới
    const user = new User({
      fullName,
      email,
      password,
      phone,
    });

    await user.save();

    // Tạo token
    const token = generateToken(user._id);

    return sendResponse(res, 201, 'Đăng ký thành công', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra thông tin
    if (!email || !password) {
      return sendError(res, 400, 'Vui lòng cung cấp email và mật khẩu');
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Vui lòng cung cấp email hợp lệ');
    }

    // Tìm người dùng và kiểm tra mật khẩu
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Email hoặc mật khẩu không hợp lệ');
    }

    const isPasswordMatched = await user.matchPassword(password);
    if (!isPasswordMatched) {
      return sendError(res, 401, 'Email hoặc mật khẩu không hợp lệ');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Tài khoản của bạn đã bị vô hiệu hóa');
    }

    // Tạo token
    const token = generateToken(user._id);

    return sendResponse(res, 200, 'Đăng nhập thành công', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'Không tìm thấy người dùng');
    }

    return sendResponse(res, 200, 'Lấy hồ sơ thành công', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone },
      { new: true, runValidators: true }
    );

    return sendResponse(res, 200, 'Cập nhật hồ sơ thành công', { user });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 400, 'Vui lòng cung cấp tất cả các trường bắt buộc');
    }

    const user = await User.findById(req.user.id).select('+password');
    const isPasswordMatched = await user.matchPassword(currentPassword);

    if (!isPasswordMatched) {
      return sendError(res, 401, 'Mật khẩu hiện tại không chính xác');
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 400, 'Mật khẩu mới không khớp');
    }

    if (!validatePassword(newPassword)) {
      return sendError(res, 400, 'Password must be at least 6 characters long');
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, 'Đổi mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};

// Quản lý địa chỉ
export const addAddress = async (req, res, next) => {
  try {
    const { fullName, phone, address, isDefault } = req.body;

    if (!fullName || !phone || !address) {
      return sendError(res, 400, 'Vui lòng cung cấp tất cả các trường bắt buộc');
    }

    const user = await User.findById(req.user.id);

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses.push({
      fullName,
      phone,
      address,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    return sendResponse(res, 201, 'Thêm địa chỉ thành công', { addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { fullName, phone, address, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === addressId);

    if (addressIndex === -1) {
      return sendError(res, 404, 'Không tìm thấy địa chỉ');
    }

    if (isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      fullName: fullName || user.addresses[addressIndex].fullName,
      phone: phone || user.addresses[addressIndex].phone,
      address: address || user.addresses[addressIndex].address,
      isDefault: isDefault !== undefined ? isDefault : user.addresses[addressIndex].isDefault,
    };

    await user.save();

    return sendResponse(res, 200, 'Cập nhật địa chỉ thành công', { addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);

    user.addresses = user.addresses.filter((addr) => addr._id.toString() !== addressId);

    if (user.addresses.length > 0 && !user.addresses.some((addr) => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return sendResponse(res, 200, 'Xóa địa chỉ thành công', { addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};
