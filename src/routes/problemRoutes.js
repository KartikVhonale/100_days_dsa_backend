import express from 'express';
import { listProblems, getProblem, getTopicBreakdown } from '../controllers/problemController.js';

const router = express.Router();

router.get('/', listProblems);
router.get('/topics', getTopicBreakdown);
router.get('/:id', getProblem);

export default router;
