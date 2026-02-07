import { sendError } from '../utils/response.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập trước');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'Bạn không có quyền truy cập tài nguyên này');
    }

    next();
  };
};

export const adminOnly = authorize('admin');
