import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  fullName: {
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
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Vui lòng cung cấp họ và tên'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Vui lòng cung cấp email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Vui lòng cung cấp email hợp lệ',
      ],
    },
    password: {
      type: String,
      required: [true, 'Vui lòng cung cấp mật khẩu'],
      minlength: 6,
      select: false,
    },
    phone: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [addressSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
    },
  },
  { timestamps: true }
);

// Mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức so sánh mật khẩu
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
