import News from '../models/News.js';
import NewsletterSubscription from '../models/NewsletterSubscription.js';
import mongoose from 'mongoose';
import { sendResponse, sendError, sendPaginatedResponse } from '../utils/response.js';
import { validatePagination } from '../utils/validators.js';
import sendEmail from '../utils/sendEmail.js';

export const getNews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, author, sort = 'newest' } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const filter = { status: 'published' };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (author) {
      filter.author = { $regex: `^${author}$`, $options: 'i' };
    }

    const sortConfig = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort(sortConfig);

    return sendPaginatedResponse(
      res,
      200,
      'Tin tức được lấy thành công',
      news,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const getAllNewsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;
    const { page: pageNum, limit: limitNum } = validatePagination(page, limit);

    const filter = {};
    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return sendPaginatedResponse(
      res,
      200,
      'Tin tức được lấy thành công',
      news,
      pageNum,
      limitNum,
      total
    );
  } catch (error) {
    next(error);
  }
};

export const getNewsBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    let newsItem = await News.findOne({ slug, status: 'published' });

    if (!newsItem && mongoose.Types.ObjectId.isValid(slug)) {
      newsItem = await News.findOne({ _id: slug, status: 'published' });
    }

    if (!newsItem) {
      return sendError(res, 404, 'Tin tức không tìm thấy');
    }

    return sendResponse(res, 200, 'Tin tức được lấy thành công', newsItem);
  } catch (error) {
    next(error);
  }
};

export const createNews = async (req, res, next) => {
  try {
    const { title, content, thumbnail, author } = req.body;

    if (!title || !content) {
      return sendError(res, 400, 'Vui lòng cung cấp tiêu đề và nội dung');
    }

    const newsItem = new News({
      title,
      content,
      thumbnail,
      author: author || 'Admin',
      status: 'draft',
    });

    await newsItem.save();

    return sendResponse(res, 201, 'Tin tức được tạo thành công', newsItem);
  } catch (error) {
    next(error);
  }
};

export const updateNews = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, thumbnail, author, status } = req.body;

    const newsItem = await News.findByIdAndUpdate(
      id,
      { title, content, thumbnail, author, status },
      { new: true, runValidators: true }
    );

    if (!newsItem) {
      return sendError(res, 404, 'Tin tức không tìm thấy');
    }

    return sendResponse(res, 200, 'Tin tức được cập nhật thành công', newsItem);
  } catch (error) {
    next(error);
  }
};

export const publishNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newsItem = await News.findByIdAndUpdate(id, { status: 'published' }, { new: true });

    if (!newsItem) {
      return sendError(res, 404, 'Tin tức không tìm thấy');
    }

    try {
      const subscribers = await NewsletterSubscription.find({}, 'email');
      const emails = subscribers.map((sub) => sub.email);

      if (emails.length > 0) {
        const subject = `Bài viết mới: ${newsItem.title}`;
        const detailKey = newsItem.slug || newsItem._id;
        const newsUrl = `${process.env.CLIENT_URL || ''}/blog/${detailKey}`;
        const html = `
          <h1>Bài viết mới từ Salvio Royale!</h1>
          <p>Chúng tôi vừa đăng một bài viết mới mà bạn có thể quan tâm:</p>
          <h2>${newsItem.title}</h2>
          <p>${newsItem.content.substring(0, 200)}...</p>
          <a href="${newsUrl}">Đọc thêm</a>
        `;

        await sendEmail({ to: emails.join(','), subject, html });
      }
    } catch (emailError) {
      // eslint-disable-next-line no-console
      console.error('Lỗi khi gửi email tin tức:', emailError);
    }

    return sendResponse(res, 200, 'Tin tức được xuất bản thành công', newsItem);
  } catch (error) {
    next(error);
  }
};

export const deleteNews = async (req, res, next) => {
  try {
    const { id } = req.params;

    const newsItem = await News.findByIdAndDelete(id);

    if (!newsItem) {
      return sendError(res, 404, 'Tin tức không tìm thấy');
    }

    return sendResponse(res, 200, 'Tin tức được xóa thành công');
  } catch (error) {
    next(error);
  }
};
