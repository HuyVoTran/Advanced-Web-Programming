import mongoose from 'mongoose';

const rewardRedemptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rewardItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RewardItem',
      required: true,
    },
    itemNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    pointsCostSnapshot: {
      type: Number,
      required: true,
      min: 1,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    totalPoints: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['approved', 'fulfilled', 'cancelled'],
      default: 'fulfilled',
    },
  },
  { timestamps: true }
);

rewardRedemptionSchema.pre(/^find/, function () {
  this.populate('rewardItem').populate('user', 'fullName email');
});

const RewardRedemption = mongoose.model('RewardRedemption', rewardRedemptionSchema);

export default RewardRedemption;
