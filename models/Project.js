import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'E-Commerce',
        'Food Ordering',
        'Business Website',
        'SaaS',
        'Dashboard',
        'Full-Stack Application',
      ],
      default: 'Full-Stack Application',
    },
    technologies: {
      type: [String],
      required: true,
      default: ['React.js', 'Node.js', 'Express.js', 'MongoDB'],
    },
    thumbnail: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    features: {
      type: [String],
      default: [],
    },
    problem: {
      type: String,
      default: '',
    },
    solution: {
      type: String,
      default: '',
    },
    development: {
      type: String,
      default: '',
    },
    results: {
      type: [String],
      default: [],
    },
    metrics: [
      {
        label: String,
        value: String,
      },
    ],
    liveUrl: {
      type: String,
      default: '',
    },
    githubUrl: {
      type: String,
      default: '',
    },
    clientName: {
      type: String,
      default: 'Enterprise Client',
    },
    completionDate: {
      type: String,
      default: '2026',
    },
    featured: {
      type: Boolean,
      default: false,
    },
    published: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ category: 1, published: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
