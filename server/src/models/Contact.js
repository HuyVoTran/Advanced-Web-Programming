import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng cung cấp họ và tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp email'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng cung cấp email hợp lệ',
      ],
    },
    phone: {
      type: String,
      required: [true, 'Vui lòng cung cấp số điện thoại'],
    },
    message: {
      type: String,
      required: [true, 'Vui lòng cung cấp tin nhắn'],
      minlength: [10, 'Tin nhắn phải ít nhất 10 ký tự'],
    },
    status: {
      type: String,
      enum: ['new', 'read', 'replied'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
