import express from 'express';
import { toggleProblem, getProgressStats } from '../controllers/progressController.js';

const router = express.Router();

router.post('/toggle', toggleProblem);
router.get('/stats', getProgressStats);

export default router;
