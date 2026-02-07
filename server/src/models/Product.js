import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng cung cấp tên sản phẩm'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: [true, 'Vui lòng cung cấp giá'],
      min: [0, 'Giá không thể âm'],
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Vui lòng cung cấp mô tả'],
    },
    material: {
      type: String,
      enum: ['gold', 'silver', 'platinum', 'diamond', 'gemstone', 'mixed'],
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng không thể âm'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Tạo slug trước khi lưu
productSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }
  next();
});

// Lấy dữ liệu danh mục và thương hiệu
productSchema.pre(/^find/, function () {
  this.populate('category').populate('brand');
});

const Product = mongoose.model('Product', productSchema);

export default Product;
