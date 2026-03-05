import NewsletterSubscription from '../models/NewsletterSubscription.js';
import { sendResponse, sendError } from '../utils/response.js';

export const subscribeToNewsletter = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // avoid duplicates
    const existing = await NewsletterSubscription.findOne({ email: email.toLowerCase() });
    if (existing) {
      return sendError(res, 409, 'Email đã đăng ký trước đó');
    }

    const sub = new NewsletterSubscription({ email });
    await sub.save();

    return sendResponse(res, 201, 'Đăng ký thành công');
  } catch (error) {
    next(error);
  }
};