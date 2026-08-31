import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    service: {
      type: String,
      default: 'General Inquiry',
    },
    budget: {
      type: String,
      default: 'Not Specified',
    },
    message: {
      type: String,
      required: [true, 'Please provide a message or project description'],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'closed'],
      default: 'new',
    },
    ipAddress: {
      type: String,
      default: '',
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

contactSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Contact || mongoose.model('Contact', contactSchema);
