import mongoose from 'mongoose';

const estimatorLeadSchema = new mongoose.Schema(
  {
    projectType: {
      type: String,
      required: true,
    },
    complexity: {
      type: String,
      required: true,
      enum: ['Basic', 'Standard', 'Advanced', 'Enterprise'],
    },
    features: {
      type: [String],
      default: [],
    },
    designLevel: {
      type: String,
      required: true,
      enum: ['Existing Design', 'Custom UI/UX', 'Premium UI/UX'],
    },
    timeline: {
      type: String,
      required: true,
    },
    numberOfPages: {
      type: String,
      default: '',
    },
    buildType: {
      type: String,
      default: '',
    },
    pricing: {
      packagePrice: { type: Number, default: 0 },
      pageExtra: { type: Number, default: 0 },
      featureTotal: { type: Number, default: 0 },
      monthlyTotal: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    customRequirements: {
      type: String,
      default: '',
    },
    contact: {
      name: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, default: '', trim: true },
      company: { type: String, default: '', trim: true },
      description: { type: String, default: '' },
    },
    estimatedMinPrice: {
      type: Number,
      required: true,
    },
    estimatedMaxPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    estimatedWeeks: {
      type: String,
      default: '2-4 weeks',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed'],
      default: 'new',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

estimatorLeadSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.EstimatorLead ||
  mongoose.model('EstimatorLead', estimatorLeadSchema);
