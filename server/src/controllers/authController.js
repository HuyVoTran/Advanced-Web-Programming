import User from '../models/User.js';
import crypto from 'crypto';
import { generateToken } from '../utils/jwt.js';
import { sendResponse, sendError } from '../utils/response.js';
import { validateEmail, validatePassword } from '../utils/validators.js';
import sendEmail from '../utils/sendEmail.js';

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
        // convenience flag for clients
        isAdmin: user.role === 'admin',
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
        isAdmin: user.role === 'admin',
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
        isAdmin: user.role === 'admin',
        addresses: user.addresses,
        favorites: user.favorites,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, settings } = req.body;
    const updatePayload = {};

    if (typeof fullName === 'string') {
      updatePayload.fullName = fullName;
    }
    if (typeof phone === 'string') {
      updatePayload.phone = phone;
    }

    if (settings && typeof settings === 'object') {
      if (settings.notifications && typeof settings.notifications === 'object') {
        if (typeof settings.notifications.email === 'boolean') {
          updatePayload['settings.notifications.email'] = settings.notifications.email;
        }
        if (typeof settings.notifications.sms === 'boolean') {
          updatePayload['settings.notifications.sms'] = settings.notifications.sms;
        }
        if (typeof settings.notifications.promotions === 'boolean') {
          updatePayload['settings.notifications.promotions'] = settings.notifications.promotions;
        }
      }

      if (typeof settings.language === 'string') {
        updatePayload['settings.language'] = settings.language;
      }
      if (typeof settings.timezone === 'string') {
        updatePayload['settings.timezone'] = settings.timezone;
      }
      if (typeof settings.currency === 'string') {
        updatePayload['settings.currency'] = settings.currency;
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updatePayload, {
      new: true,
      runValidators: true,
    });

    return sendResponse(res, 200, 'Cập nhật hồ sơ thành công', {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isAdmin: user.role === 'admin',
        addresses: user.addresses,
        favorites: user.favorites,
        settings: user.settings,
        createdAt: user.createdAt,
      },
    });
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
    const { fullName, phone, address, city, district, ward, isDefault } = req.body;

    if (!fullName || !phone || !address || !city || !district) {
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
      city,
      district,
      ward: ward || '',
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
    const { fullName, phone, address, city, district, ward, isDefault } = req.body;

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
      city: city || user.addresses[addressIndex].city,
      district: district || user.addresses[addressIndex].district,
      ward: ward !== undefined ? ward : user.addresses[addressIndex].ward,
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

export const addFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return sendError(res, 400, 'Thiếu mã sản phẩm');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'Không tìm thấy người dùng');
    }

    const alreadyFavorite = user.favorites.some((item) => item.toString() === productId);

    if (!alreadyFavorite) {
      user.favorites.push(productId);
      await user.save();
    }

    return sendResponse(res, 200, 'Đã thêm vào yêu thích', {
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return sendError(res, 400, 'Thiếu mã sản phẩm');
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 404, 'Không tìm thấy người dùng');
    }

    user.favorites = user.favorites.filter((item) => item.toString() !== productId);
    await user.save();

    return sendResponse(res, 200, 'Đã xóa khỏi yêu thích', {
      favorites: user.favorites,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, 'Vui lòng cung cấp email');
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Vui lòng cung cấp email hợp lệ');
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 200, 'Nếu email tồn tại, mã OTP đã được gửi');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

    user.resetPasswordOtp = hashedOtp;
    user.resetPasswordOtpExpires = Date.now() + 10 * 60 * 1000;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Mã OTP khôi phục mật khẩu',
      html: `
        <p>Xin chào ${user.fullName || 'bạn'},</p>
        <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
        <h2 style="letter-spacing: 4px;">${otp}</h2>
        <p>Mã có hiệu lực trong 10 phút.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      `,
      text: `Mã OTP khôi phục mật khẩu: ${otp}. Mã có hiệu lực trong 10 phút.`,
    });

    return sendResponse(res, 200, 'Nếu email tồn tại, mã OTP đã được gửi');
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return sendError(res, 400, 'Vui lòng cung cấp đầy đủ thông tin');
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Vui lòng cung cấp email hợp lệ');
    }

    if (!/^\d{6}$/.test(String(otp))) {
      return sendError(res, 400, 'Mã OTP không hợp lệ');
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, 'Mật khẩu không khớp');
    }

    if (!validatePassword(password)) {
      return sendError(res, 400, 'Mật khẩu phải ít nhất 6 ký tự');
    }

    const hashedOtp = crypto.createHash('sha256').update(String(otp)).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordOtp: hashedOtp,
      resetPasswordOtpExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return sendError(res, 400, 'Mã OTP không hợp lệ hoặc đã hết hạn');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordOtpExpires = undefined;
    await user.save();

    return sendResponse(res, 200, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    next(error);
  }
};
