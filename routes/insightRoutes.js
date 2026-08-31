import express from 'express';
import {
  getInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
} from '../controllers/insightController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getInsights);
router.get('/:slug', getInsightBySlug);

// Protected Admin Routes
router.post('/', protect, authorize('admin', 'superadmin'), createInsight);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateInsight);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteInsight);

export default router;
