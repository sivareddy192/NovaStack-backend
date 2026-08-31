import PricingConfig from '../models/PricingConfig.js';
import { defaultPricingConfig } from '../config/seedData.js';
import { isDbConnected } from '../config/db.js';

export const getActivePricingConfig = async () => {
  if (isDbConnected()) {
    try {
      const config = await PricingConfig.findOne({ isDefault: true }).lean();
      if (config) {
        return config;
      }
    } catch (error) {
      // Graceful fallback
    }
  }
  return defaultPricingConfig;
};

export const calculateProjectEstimate = async ({
  projectType,
  complexity,
  features = [],
  designLevel,
  timeline,
}) => {
  const config = await getActivePricingConfig();

  // Find project type config
  const selectedType = config.projectTypes.find(
    (pt) =>
      pt.name.toLowerCase() === (projectType || '').toLowerCase() ||
      pt.id.toLowerCase() === (projectType || '').toLowerCase()
  ) || {
    basePrice: 25000,
    baseWeeks: 2,
    name: projectType || 'Custom Project',
  };

  const basePrice = selectedType.basePrice || 25000;
  let totalWeeks = selectedType.baseWeeks || 2;

  // Complexity multiplier
  const complexityMultiplier =
    config.complexityMultipliers?.[complexity] || 1.0;

  // Features sum
  let featuresCost = 0;
  const matchedFeatures = [];

  if (Array.isArray(features)) {
    features.forEach((featureIdOrName) => {
      const match = config.featuresPricing.find(
        (f) =>
          f.id.toLowerCase() === String(featureIdOrName).toLowerCase() ||
          f.name.toLowerCase() === String(featureIdOrName).toLowerCase()
      );
      if (match) {
        featuresCost += match.price;
        totalWeeks += match.weeks || 0.5;
        matchedFeatures.push(match.name);
      } else {
        // Generic fallback feature cost
        featuresCost += 5000;
        totalWeeks += 0.5;
        matchedFeatures.push(String(featureIdOrName));
      }
    });
  }

  // Design multiplier
  const designMultiplier =
    config.designMultipliers?.[designLevel] || 1.0;

  // Timeline multiplier
  const timelineMultiplier =
    config.timelineMultipliers?.[timeline] || 1.0;

  // Base raw calculated cost
  const rawSubtotal = (basePrice + featuresCost) * complexityMultiplier * designMultiplier * timelineMultiplier;

  // Calculate realistic range (e.g. -10% to +20% for scope variance and buffer)
  const minPrice = Math.round((rawSubtotal * 0.9) / 500) * 500;
  const maxPrice = Math.round((rawSubtotal * 1.2) / 500) * 500;

  // Formatted weeks estimate
  const roundedWeeks = Math.max(1, Math.round(totalWeeks));
  const estimatedWeeksStr =
    timeline || (roundedWeeks <= 2 ? '1–2 weeks' : roundedWeeks <= 4 ? '2–4 weeks' : '1–2 months');

  return {
    projectType: selectedType.name,
    complexity: complexity || 'Standard',
    features: matchedFeatures,
    designLevel: designLevel || 'Custom UI/UX',
    timeline: timeline || estimatedWeeksStr,
    currency: config.currency || 'INR',
    currencySymbol: config.currencySymbol || '₹',
    estimatedMinPrice: minPrice,
    estimatedMaxPrice: maxPrice,
    formattedRange: `${config.currencySymbol || '₹'}${minPrice.toLocaleString()} – ${config.currencySymbol || '₹'}${maxPrice.toLocaleString()}`,
    estimatedWeeks: estimatedWeeksStr,
  };
};
