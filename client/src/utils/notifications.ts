import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

// Helper functions for consistent toast notifications throughout the app

export const notify = {
  success: (title: string, description?: string) => {
    toast.success(title, {
      description,
      icon: <CheckCircle className="w-5 h-5" />,
    });
  },

  error: (title: string, description?: string) => {
    toast.error(title, {
      description,
      icon: <XCircle className="w-5 h-5" />,
    });
  },

  warning: (title: string, description?: string) => {
    toast.warning(title, {
      description,
      icon: <AlertTriangle className="w-5 h-5" />,
    });
  },

  info: (title: string, description?: string) => {
    toast.info(title, {
      description,
      icon: <Info className="w-5 h-5" />,
    });
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },

  // E-commerce specific notifications
  addedToCart: (productName: string) => {
    notify.success('Đã thêm vào giỏ hàng', productName);
  },

  removedFromCart: (productName: string) => {
    notify.info('Đã xóa khỏi giỏ hàng', productName);
  },

  orderPlaced: (orderNumber: string) => {
    notify.success('Đặt hàng thành công!', `Mã đơn hàng: ${orderNumber}`);
  },

  orderCancelled: (orderNumber: string) => {
    notify.warning('Đơn hàng đã bị hủy', `Mã đơn hàng: ${orderNumber}`);
  },

  outOfStock: (productName: string) => {
    notify.error('Sản phẩm hết hàng', productName);
  },

  loginSuccess: (userName: string) => {
    notify.success('Đăng nhập thành công', `Chào mừng ${userName}!`);
  },

  loginError: () => {
    notify.error('Đăng nhập thất bại', 'Email hoặc mật khẩu không chính xác');
  },

  registrationSuccess: () => {
    notify.success('Đăng ký thành công', 'Bạn có thể đăng nhập ngay bây giờ');
  },

  profileUpdated: () => {
    notify.success('Cập nhật thành công', 'Thông tin của bạn đã được cập nhật');
  },

  passwordChanged: () => {
    notify.success('Đổi mật khẩu thành công', 'Vui lòng đăng nhập lại với mật khẩu mới');
  },

  addressAdded: () => {
    notify.success('Đã thêm địa chỉ mới');
  },

  addressDeleted: () => {
    notify.info('Đã xóa địa chỉ');
  },

  wishlistAdded: (productName: string) => {
    notify.success('Đã thêm vào danh sách yêu thích', productName);
  },

  wishlistRemoved: (productName: string) => {
    notify.info('Đã xóa khỏi danh sách yêu thích', productName);
  },

  reviewSubmitted: () => {
    notify.success('Đánh giá đã được gửi', 'Cảm ơn bạn đã đánh giá!');
  },

  copyToClipboard: (text: string = 'Đã sao chép') => {
    notify.success(text);
  },
};
