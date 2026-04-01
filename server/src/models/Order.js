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
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Virtual: mã đơn hàng hiển thị (ORD- + 6 ký tự cuối của _id viết hoa)
orderSchema.virtual('orderNumber').get(function () {
  return 'ORD-' + this._id.toString().slice(-6).toUpperCase();
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

// Lấy dữ liệu sản phẩm và người dùng
orderSchema.pre(/^find/, function () {
  this.populate('items.product').populate('user');
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
