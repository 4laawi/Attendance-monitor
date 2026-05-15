import { Router } from 'express';
import { 
  getDashboardStats, 
  getJustifications, 
  reviewJustification 
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/stats', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'TEACHER']), getDashboardStats);
router.get('/justifications', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'TEACHER']), getJustifications);
router.patch('/justifications/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN', 'TEACHER']), reviewJustification);

export default router;
