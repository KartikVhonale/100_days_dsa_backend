import express from 'express';
import { getTrackMatrix } from '../controllers/trackController.js';

const router = express.Router();

router.get('/', getTrackMatrix);

export default router;
