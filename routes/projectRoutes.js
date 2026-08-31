import express from 'express';
import {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getProjects);
router.get('/:slug', getProjectBySlug);

// Protected Admin Routes
router.post('/', protect, authorize('admin', 'superadmin'), createProject);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateProject);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteProject);

export default router;
