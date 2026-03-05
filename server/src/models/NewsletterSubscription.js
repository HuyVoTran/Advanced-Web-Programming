import mongoose from 'mongoose';

const newsletterSubscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const NewsletterSubscription = mongoose.model(
  'NewsletterSubscription',
  newsletterSubscriptionSchema
);

export default NewsletterSubscription;
