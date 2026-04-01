import NewsletterSubscription from '../models/NewsletterSubscription.js';
import User from '../models/User.js';
import { sendResponse, sendError } from '../utils/response.js';
import sendEmail from '../utils/sendEmail.js';

const normalizeContent = (content = '') => {
  const safe = String(content).trim();
  const html = `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">${safe
    .replace(/\n/g, '<br />')}
  </div>`;
  return { html, text: safe };
};

export const getNewsletterSubscribers = async (req, res, next) => {
  try {
    const subscribers = await NewsletterSubscription.find({})
      .select('email createdAt')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Danh sách người đăng ký newsletter', subscribers);
  } catch (error) {
    next(error);
  }
};

export const getNewsletterUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user', isActive: true })
      .select('email fullName createdAt')
      .sort({ createdAt: -1 });

    return sendResponse(res, 200, 'Danh sách người dùng', users);
  } catch (error) {
    next(error);
  }
};

export const sendNewsletterBroadcast = async (req, res, next) => {
  try {
    const { subject, content, audience = 'all' } = req.body;

    if (!subject || !content) {
      return sendError(res, 400, 'Vui lòng cung cấp tiêu đề và nội dung');
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return sendError(
        res,
        503,
        'Chức năng gửi email chưa được cấu hình. Vui lòng thiết lập EMAIL_USER và EMAIL_PASS ở server.'
      );
    }

    let emails = [];

    if (audience === 'subscribers' || audience === 'all') {
      const subscribers = await NewsletterSubscription.find({}).select('email');
      emails = emails.concat(subscribers.map((s) => s.email));
    }

    if (audience === 'users' || audience === 'all') {
      const users = await User.find({ role: 'user', isActive: true }).select('email');
      emails = emails.concat(users.map((u) => u.email));
    }

    const uniqueEmails = Array.from(
      new Set(
        emails
          .filter((e) => typeof e === 'string')
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean)
      )
    );

    if (uniqueEmails.length === 0) {
      return sendError(res, 400, 'Không có người nhận phù hợp');
    }

    const { html, text } = normalizeContent(content);

    try {
      await sendEmail({
        to: uniqueEmails.join(','),
        subject,
        html,
        text,
      });
    } catch (sendErr) {
      const isAuthError =
        sendErr?.code === 'EAUTH' ||
        sendErr?.responseCode === 535 ||
        /auth|credential|username|password/i.test(sendErr?.message || '');

      if (isAuthError) {
        return sendError(res, 502, 'Không thể xác thực máy chủ email. Vui lòng kiểm tra cấu hình SMTP.');
      }

      return sendError(res, 502, `Gửi email thất bại: ${sendErr?.message || 'SMTP error'}`);
    }

    return sendResponse(res, 200, 'Đã gửi thông báo', { count: uniqueEmails.length });
  } catch (error) {
    next(error);
  }
};
