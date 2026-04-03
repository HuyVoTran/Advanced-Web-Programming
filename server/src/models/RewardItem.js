import mongoose from 'mongoose';

const rewardItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    pointsCost: {
      type: Number,
      required: true,
      min: 1,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    redeemedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPointsRedeemed: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const RewardItem = mongoose.model('RewardItem', rewardItemSchema);

export default RewardItem;
