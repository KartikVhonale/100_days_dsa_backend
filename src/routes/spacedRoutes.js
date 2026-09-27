import express from 'express';
import { listSpacedReviews, updateReviewStatus } from '../controllers/spacedController.js';

const router = express.Router();

router.get('/', listSpacedReviews);
router.patch('/:id', updateReviewStatus);

export default router;
