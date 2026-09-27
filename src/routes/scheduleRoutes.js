import express from 'express';
import { rebalancePlanController } from '../controllers/scheduleController.js';

const router = express.Router();

// Matches POST /api/plans/:id/rebalance when mounted at /api/plans
router.post('/:id/rebalance', rebalancePlanController);

// Matches POST /api/plans/rebalance with body.userId
router.post('/rebalance', (req, res, next) => {
  req.params.id = req.body.userId || req.body.id || 'default_candidate';
  return rebalancePlanController(req, res, next);
});

export default router;
