import { Router } from 'express';
import { markAttendance, generateQR, scanQR } from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/mark', authenticate, authorize(['TEACHER', 'ADMIN', 'SUPER_ADMIN']), markAttendance);
router.post('/generate-qr/:sessionId', authenticate, authorize(['TEACHER']), generateQR);
router.post('/scan-qr', authenticate, authorize(['STUDENT']), scanQR);

export default router;
