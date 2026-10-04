import EstimatorLead from '../models/EstimatorLead.js';
import {
  getActivePricingConfig,
  calculateProjectEstimate,
} from '../services/calculationService.js';

let localEstimatorLeads = [];

export const getConfig = async (req, res) => {
  try {
    const config = await getActivePricingConfig();
    res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const calculateEstimate = async (req, res) => {
  try {
    const { projectType, complexity, features, designLevel, timeline } = req.body;

    const result = await calculateProjectEstimate({
      projectType,
      complexity,
      features,
      designLevel,
      timeline,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const submitEstimatorLead = async (req, res) => {
  try {
    const {
      projectType,
      complexity,
      features,
      designLevel,
      timeline,
      contact,
      numberOfPages,
      buildType,
      pricing,
      customRequirements,
    } = req.body;

    const calculation = await calculateProjectEstimate({
      projectType,
      complexity,
      features,
      designLevel,
      timeline,
    });

    try {
      const lead = await EstimatorLead.create({
        projectType: calculation.projectType,
        complexity,
        features: calculation.features,
        designLevel,
        timeline: calculation.timeline,
        contact,
        numberOfPages: numberOfPages || '',
        buildType: buildType || '',
        pricing: pricing || {},
        customRequirements: customRequirements || contact?.description || '',
        estimatedMinPrice: calculation.estimatedMinPrice,
        estimatedMaxPrice: calculation.estimatedMaxPrice,
        currency: calculation.currency,
        estimatedWeeks: calculation.estimatedWeeks,
        status: 'new',
      });

      return res.status(201).json({
        success: true,
        message: 'Your project estimate and quote request have been received! We will reach out shortly.',
        data: lead,
      });
    } catch (dbErr) {
      const newLead = {
        _id: `est-lead-${Date.now()}`,
        projectType: calculation.projectType,
        complexity,
        features: calculation.features,
        designLevel,
        timeline: calculation.timeline,
        contact,
        numberOfPages: numberOfPages || '',
        buildType: buildType || '',
        pricing: pricing || {},
        customRequirements: customRequirements || contact?.description || '',
        estimatedMinPrice: calculation.estimatedMinPrice,
        estimatedMaxPrice: calculation.estimatedMaxPrice,
        currency: calculation.currency,
        estimatedWeeks: calculation.estimatedWeeks,
        status: 'new',
        createdAt: new Date(),
      };
      localEstimatorLeads.unshift(newLead);

      return res.status(201).json({
        success: true,
        message: 'Your project estimate and quote request have been received! We will reach out shortly.',
        data: newLead,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const getEstimatorLeads = async (req, res) => {
  try {
    const { status } = req.query;

    try {
      const query = {};
      if (status && status !== 'all') {
        query.status = status;
      }

      const leads = await EstimatorLead.find(query).sort({ createdAt: -1 });
      if (leads.length > 0) {
        return res.status(200).json({
          success: true,
          count: leads.length,
          data: leads,
        });
      }
    } catch (e) {}

    let filtered = [...localEstimatorLeads];
    if (status && status !== 'all') {
      filtered = filtered.filter((l) => l.status === status);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

export const updateEstimatorLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    try {
      const lead = await EstimatorLead.findByIdAndUpdate(
        id,
        { status, ...(notes !== undefined && { notes }) },
        { new: true }
      );
      if (lead) {
        return res.status(200).json({
          success: true,
          data: lead,
        });
      }
    } catch (e) {}

    const index = localEstimatorLeads.findIndex((l) => l._id === id);
    if (index !== -1) {
      localEstimatorLeads[index].status = status || localEstimatorLeads[index].status;
      if (notes !== undefined) localEstimatorLeads[index].notes = notes;
      return res.status(200).json({
        success: true,
        data: localEstimatorLeads[index],
      });
    }

    res.status(404).json({ success: false, message: 'Estimator lead not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
