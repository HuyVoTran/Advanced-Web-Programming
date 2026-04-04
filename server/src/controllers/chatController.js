import ChatConversation from '../models/ChatConversation.js';
import ChatMessage from '../models/ChatMessage.js';
import { sendError, sendResponse } from '../utils/response.js';

const formatConversation = (conversation) => {
  const value = conversation.toObject ? conversation.toObject() : conversation;
  return {
    ...value,
    id: String(value._id),
  };
};

const ensureAccessConversation = async ({ conversationId, requesterId, isAdmin }) => {
  const conversation = await ChatConversation.findById(conversationId)
    .populate('user', 'fullName email')
    .populate('assignedAdmin', 'fullName email');

  if (!conversation) {
    return { error: 'Không tìm thấy cuộc trò chuyện' };
  }

  if (!isAdmin && String(conversation.user?._id || conversation.user) !== String(requesterId)) {
    return { error: 'Bạn không có quyền truy cập cuộc trò chuyện này' };
  }

  return { conversation };
};

const appendMessageToConversation = async ({ conversation, sender, senderRole, content }) => {
  const message = await ChatMessage.create({
    conversation: conversation._id,
    sender,
    senderRole,
    content,
    isRead: false,
  });

  conversation.lastMessagePreview = String(content).slice(0, 300);
  conversation.lastMessageAt = new Date();

  if (senderRole === 'admin') {
    conversation.assignedAdmin = sender;
  }

  await conversation.save();

  return message;
};

export const getMyChatConversations = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập');
    }

    const conversations = await ChatConversation.find({ user: req.user.id })
      .populate('assignedAdmin', 'fullName email')
      .sort({ lastMessageAt: -1 });

    return sendResponse(res, 200, 'Danh sách chat được lấy thành công', conversations.map(formatConversation));
  } catch (error) {
    next(error);
  }
};

export const createOrGetMyConversation = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập');
    }

    const subject = String(req.body?.subject || 'Tư vấn sản phẩm').trim();
    const firstMessage = String(req.body?.message || '').trim();

    let conversation = await ChatConversation.findOne({ user: req.user.id, status: 'open' })
      .sort({ updatedAt: -1 })
      .populate('user', 'fullName email')
      .populate('assignedAdmin', 'fullName email');

    if (!conversation) {
      conversation = await ChatConversation.create({
        user: req.user.id,
        subject: subject || 'Tư vấn sản phẩm',
      });
      conversation = await ChatConversation.findById(conversation._id)
        .populate('user', 'fullName email')
        .populate('assignedAdmin', 'fullName email');
    }

    if (firstMessage) {
      await appendMessageToConversation({
        conversation,
        sender: req.user.id,
        senderRole: 'user',
        content: firstMessage,
      });
    }

    return sendResponse(res, 200, 'Khởi tạo chat thành công', formatConversation(conversation));
  } catch (error) {
    next(error);
  }
};

export const getConversationMessages = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập');
    }

    const isAdmin = req.user.role === 'admin';
    const { conversationId } = req.params;

    const { conversation, error } = await ensureAccessConversation({
      conversationId,
      requesterId: req.user.id,
      isAdmin,
    });

    if (error) {
      return sendError(res, error === 'Không tìm thấy cuộc trò chuyện' ? 404 : 403, error);
    }

    const messages = await ChatMessage.find({ conversation: conversation._id })
      .populate('sender', 'fullName email role')
      .sort({ createdAt: 1 });

    if (!isAdmin) {
      await ChatMessage.updateMany(
        { conversation: conversation._id, senderRole: 'admin', isRead: false },
        { isRead: true }
      );
    } else {
      await ChatMessage.updateMany(
        { conversation: conversation._id, senderRole: 'user', isRead: false },
        { isRead: true }
      );
    }

    return sendResponse(res, 200, 'Tin nhắn được lấy thành công', {
      conversation: formatConversation(conversation),
      messages,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessageToConversation = async (req, res, next) => {
  try {
    if (!req.user) {
      return sendError(res, 401, 'Vui lòng đăng nhập');
    }

    const content = String(req.body?.content || '').trim();
    if (!content) {
      return sendError(res, 400, 'Nội dung tin nhắn không được để trống');
    }

    const isAdmin = req.user.role === 'admin';
    const { conversationId } = req.params;

    const { conversation, error } = await ensureAccessConversation({
      conversationId,
      requesterId: req.user.id,
      isAdmin,
    });

    if (error) {
      return sendError(res, error === 'Không tìm thấy cuộc trò chuyện' ? 404 : 403, error);
    }

    if (conversation.status === 'closed') {
      return sendError(res, 400, 'Cuộc trò chuyện đã đóng');
    }

    const message = await appendMessageToConversation({
      conversation,
      sender: req.user.id,
      senderRole: isAdmin ? 'admin' : 'user',
      content,
    });

    const populatedMessage = await ChatMessage.findById(message._id).populate('sender', 'fullName email role');

    return sendResponse(res, 201, 'Gửi tin nhắn thành công', populatedMessage || message);
  } catch (error) {
    next(error);
  }
};

export const getAllConversationsAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['open', 'closed'].includes(status)) {
      filter.status = status;
    }

    const conversations = await ChatConversation.find(filter)
      .populate('user', 'fullName email')
      .populate('assignedAdmin', 'fullName email')
      .sort({ lastMessageAt: -1 });

    const conversationIds = conversations.map((item) => item._id);
    const unreadRows = await ChatMessage.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          senderRole: 'user',
          isRead: false,
        },
      },
      {
        $group: {
          _id: '$conversation',
          unreadCount: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = unreadRows.reduce((acc, row) => {
      acc[String(row._id)] = row.unreadCount;
      return acc;
    }, {});

    const payload = conversations.map((conversation) => ({
      ...formatConversation(conversation),
      unreadCount: unreadMap[String(conversation._id)] || 0,
    }));

    return sendResponse(res, 200, 'Danh sách hội thoại được lấy thành công', payload);
  } catch (error) {
    next(error);
  }
};

export const updateConversationStatusAdmin = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { status } = req.body;

    if (!['open', 'closed'].includes(status)) {
      return sendError(res, 400, 'Trạng thái hội thoại không hợp lệ');
    }

    const conversation = await ChatConversation.findById(conversationId)
      .populate('user', 'fullName email')
      .populate('assignedAdmin', 'fullName email');

    if (!conversation) {
      return sendError(res, 404, 'Không tìm thấy cuộc trò chuyện');
    }

    conversation.status = status;
    if (req.user?.id) {
      conversation.assignedAdmin = req.user.id;
    }
    await conversation.save();

    return sendResponse(res, 200, 'Cập nhật trạng thái chat thành công', formatConversation(conversation));
  } catch (error) {
    next(error);
  }
};