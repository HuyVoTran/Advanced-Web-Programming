import Notification from '../models/Notification.js';

export const createNotification = async ({ userId, type = 'system', title, message, link = '', metadata = {} }) => {
  if (!userId || !title || !message) {
    return null;
  }

  return Notification.create({
    user: userId,
    type,
    title,
    message,
    link,
    metadata,
  });
};