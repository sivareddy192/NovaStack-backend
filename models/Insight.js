import mongoose from 'mongoose';

const insightSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Insight title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Web Development',
        'MERN Stack',
        'Business Websites',
        'E-Commerce',
        'Performance',
        'UI/UX',
        'SEO',
        'Technology',
        'Architecture',
      ],
      default: 'Web Development',
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      name: { type: String, default: 'NovaStack Engineering Team' },
      role: { type: String, default: 'Full-Stack Architecture' },
      avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    },
    readTime: {
      type: String,
      default: '5 min read',
    },
    coverImage: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

insightSchema.index({ category: 1, published: 1 });

export default mongoose.models.Insight || mongoose.model('Insight', insightSchema);
