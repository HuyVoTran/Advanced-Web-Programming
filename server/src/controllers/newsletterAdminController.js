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

    let emails = [];

    if (audience === 'subscribers' || audience === 'all') {
      const subscribers = await NewsletterSubscription.find({}).select('email');
      emails = emails.concat(subscribers.map((s) => s.email));
    }

    if (audience === 'users' || audience === 'all') {
      const users = await User.find({ role: 'user', isActive: true }).select('email');
      emails = emails.concat(users.map((u) => u.email));
    }

    const uniqueEmails = Array.from(new Set(emails.map((e) => e.toLowerCase())));

    if (uniqueEmails.length === 0) {
      return sendError(res, 400, 'Không có người nhận phù hợp');
    }

    const { html, text } = normalizeContent(content);

    await sendEmail({
      to: uniqueEmails.join(','),
      subject,
      html,
      text,
    });

    return sendResponse(res, 200, 'Đã gửi thông báo', { count: uniqueEmails.length });
  } catch (error) {
    next(error);
  }
};
