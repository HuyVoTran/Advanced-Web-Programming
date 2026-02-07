export const validateEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateProductData = (data) => {
  const errors = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Tên sản phẩm là bắt buộc');
  }

  if (!data.price || data.price < 0) {
    errors.push('Giá hợp lệ là bắt buộc');
  }

  if (!data.description || data.description.trim() === '') {
    errors.push('Mô tả là bắt buộc');
  }

  if (!data.category) {
    errors.push('Danh mục là bắt buộc');
  }

  if (!data.brand) {
    errors.push('Thương hiệu là bắt buộc');
  }

  return errors;
};

export const validatePagination = (page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
  return { page: pageNum, limit: limitNum };
};
