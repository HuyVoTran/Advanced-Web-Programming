import Contact from '../models/Contact.js';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validateEmail, validatePhone } from '../utils/validators.js';
import { validatePagination } from '../utils/validators.js';

export const createContact = async (req, res, next) => {
  try {
    const { fullName, email, phone, message } = req.body;

    // Xác thực
    if (!fullName || !email || !phone || !message) {
      return sendError(res, 400, 'Vui lòng cung cấp tất cả các trường bắt buộc');
    }

    if (!validateEmail(email)) {
      return sendError(res, 400, 'Vui lòng cung cấp địa chỉ email hợp lệ');
    }

    if (!validatePhone(phone)) {
      return sendError(res, 400, 'Vui lòng cung cấp số điện thoại hợp lệ');
    }

    if (message.trim().length < 10) {
      return sendError(res, 400, 'Tin nhắn phải có ít nhất 10 ký tự');
    }

    const contact = new Contact({
      fullName,
      email,
      phone,
      message,
    });

    await contact.save();

    return sendResponse(res, 201, 'Tin nhắn liên hệ được lưu thành công', contact);
  } catch (error) {
    next(error);
  }
};

export const getContacts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Liên hệ được lấy thành công',
      contacts,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const getContactById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(id, { status: 'read' }, { new: true });

    if (!contact) {
      return sendError(res, 404, 'Liên hệ không tìm thấy');
    }

    return sendResponse(res, 200, 'Liên hệ được lấy thành công', contact);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return sendError(res, 404, 'Liên hệ không tìm thấy');
    }

    return sendResponse(res, 200, 'Liên hệ được xóa thành công');
  } catch (error) {
    next(error);
  }
};
