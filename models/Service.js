import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    fullDescription: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
      default: 'Code',
    },
    deliverables: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
    },
    benefits: {
      type: [String],
      default: [],
    },
    startingPrice: {
      type: String,
      default: 'Contact for Quote',
    },
    order: {
      type: Number,
      default: 0,
    },
    published: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);
