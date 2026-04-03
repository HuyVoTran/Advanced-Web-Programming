import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Số lượng phải ít nhất là 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  salePercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
});

const customerInfoSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    default: '',
  },
  district: {
    type: String,
    default: '',
  },
  ward: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerInfo: {
      type: customerInfoSchema,
      required: true,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalOriginalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    couponCode: {
      type: String,
      default: '',
      trim: true,
    },
    couponDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyPointsAwarded: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyMultiplierApplied: {
      type: Number,
      default: 1,
      min: 1,
    },
    loyaltyRankApplied: {
      type: String,
      default: 'member',
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'bank_transfer'],
      default: 'cod',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancelReason: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Lý do hủy tối đa 500 ký tự'],
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Lấy dữ liệu sản phẩm và người dùng
orderSchema.pre(/^find/, function () {
  this.populate('items.product').populate('user');
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
