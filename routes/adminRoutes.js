import express from 'express';
import {
  getDashboardStats,
  updatePricingConfig,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes protected
router.use(protect, authorize('admin', 'superadmin'));

router.get('/dashboard', getDashboardStats);
router.put('/pricing-config', updatePricingConfig);

// User and Role Management routes
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

export default router;
