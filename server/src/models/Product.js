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
    salePercent: {
      type: Number,
      default: 0,
      min: [0, 'Phần trăm giảm giá không thể âm'],
      max: [100, 'Phần trăm giảm giá không được vượt quá 100'],
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
    hasSizes: {
      type: Boolean,
      default: false,
    },
    sizeStocks: [
      {
        size: {
          type: String,
          required: true,
          trim: true,
        },
        quantity: {
          type: Number,
          default: 0,
          min: [0, 'Số lượng size không thể âm'],
        },
      },
    ],
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

  if (this.hasSizes) {
    const normalizedSizeStocks = Array.isArray(this.sizeStocks)
      ? this.sizeStocks
          .map((item) => ({
            size: String(item?.size || '').trim(),
            quantity: Math.max(0, Number(item?.quantity || 0)),
          }))
          .filter((item) => item.size.length > 0)
      : [];

    this.sizeStocks = normalizedSizeStocks;
    this.stock = normalizedSizeStocks.reduce((sum, item) => sum + item.quantity, 0);
  } else {
    this.sizeStocks = [];
  }

  next();
});

// Lấy dữ liệu danh mục và thương hiệu
productSchema.pre(/^find/, function () {
  this.populate('category').populate('brand');
});

const Product = mongoose.model('Product', productSchema);

export default Product;
