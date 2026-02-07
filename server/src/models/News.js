import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng cung cấp tiêu đề'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    thumbnail: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      required: [true, 'Vui lòng cung cấp nội dung'],
    },
    author: {
      type: String,
      default: 'Admin',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

// Tạo slug trước khi lưu
newsSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  next();
});

const News = mongoose.model('News', newsSchema);

export default News;
