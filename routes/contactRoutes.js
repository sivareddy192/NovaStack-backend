import express from 'express';
import {
  submitContact,
  getContacts,
  updateContactStatus,
  deleteContact,
} from '../controllers/contactController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { formSubmissionLimiter } from '../middleware/rateLimiter.js';
import { validateContactInput } from '../middleware/validator.js';

const router = express.Router();

// Public lead submission
router.post('/', formSubmissionLimiter, validateContactInput, submitContact);

// Protected Admin routes
router.get('/', protect, authorize('admin', 'superadmin'), getContacts);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateContactStatus);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteContact);

export default router;
