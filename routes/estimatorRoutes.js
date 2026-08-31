import express from 'express';
import {
  getConfig,
  calculateEstimate,
  submitEstimatorLead,
  getEstimatorLeads,
  updateEstimatorLeadStatus,
} from '../controllers/estimatorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { formSubmissionLimiter } from '../middleware/rateLimiter.js';
import { validateEstimatorLeadInput } from '../middleware/validator.js';

const router = express.Router();

// Public calculation and configuration
router.get('/config', getConfig);
router.post('/calculate', calculateEstimate);
router.post('/lead', formSubmissionLimiter, validateEstimatorLeadInput, submitEstimatorLead);

// Protected Admin routes
router.get('/leads', protect, authorize('admin', 'superadmin'), getEstimatorLeads);
router.put('/leads/:id', protect, authorize('admin', 'superadmin'), updateEstimatorLeadStatus);

export default router;
