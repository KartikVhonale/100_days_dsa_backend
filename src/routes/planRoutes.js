import express from 'express';
import { getDailyPlan, updateTrackOrDates } from '../controllers/planController.js';

const router = express.Router();

router.get('/daily', getDailyPlan);
router.post('/settings', updateTrackOrDates);

export default router;
