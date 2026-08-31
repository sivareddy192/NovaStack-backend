import mongoose from 'mongoose';

const pricingConfigSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      default: 'INR',
    },
    currencySymbol: {
      type: String,
      default: '₹',
    },
    projectTypes: [
      {
        id: String,
        name: String,
        basePrice: Number,
        baseWeeks: Number,
      },
    ],
    complexityMultipliers: {
      Basic: { type: Number, default: 1.0 },
      Standard: { type: Number, default: 1.4 },
      Advanced: { type: Number, default: 2.0 },
      Enterprise: { type: Number, default: 3.2 },
    },
    featuresPricing: [
      {
        id: String,
        name: String,
        price: Number,
        weeks: Number,
        description: String,
      },
    ],
    designMultipliers: {
      'Existing Design': { type: Number, default: 1.0 },
      'Custom UI/UX': { type: Number, default: 1.25 },
      'Premium UI/UX': { type: Number, default: 1.5 },
    },
    timelineMultipliers: {
      '1–2 weeks': { type: Number, default: 1.3 }, // Express delivery premium
      '2–4 weeks': { type: Number, default: 1.15 },
      '1–2 months': { type: Number, default: 1.0 },
      '2+ months': { type: Number, default: 0.95 },
    },
    isDefault: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PricingConfig ||
  mongoose.model('PricingConfig', pricingConfigSchema);
