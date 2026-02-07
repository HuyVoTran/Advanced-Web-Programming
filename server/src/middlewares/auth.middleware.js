import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'Không có token được cung cấp. Vui lòng đăng nhập trước.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return sendError(res, 401, 'Người dùng không tìm thấy.');
    }

    if (!user.isActive) {
      return sendError(res, 403, 'Tài khoản người dùng đã bị vô hiệu hóa.');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 401, error.message || 'Token không hợp lệ.');
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await User.findById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
};
