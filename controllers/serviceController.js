import Service from '../models/Service.js';
import { seedServices } from '../config/seedData.js';
import { isDbConnected } from '../config/db.js';

let localServices = [...seedServices];

export const getServices = async (req, res) => {
  try {
    if (isDbConnected()) {
      try {
        const services = await Service.find({ published: true }).sort({ order: 1 });
        if (services && services.length > 0) {
          return res.status(200).json({
            success: true,
            count: services.length,
            data: services,
          });
        }
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      count: localServices.length,
      data: localServices,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isDbConnected()) {
      try {
        const service = await Service.findOne({ slug, published: true });
        if (service) {
          return res.status(200).json({
            success: true,
            data: service,
          });
        }
      } catch (e) {}
    }

    const fallback = localServices.find((s) => s.slug === slug);
    if (!fallback) {
      return res.status(404).json({
        success: false,
        message: `Service with slug '${slug}' not found`,
      });
    }

    res.status(200).json({
      success: true,
      data: fallback,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
