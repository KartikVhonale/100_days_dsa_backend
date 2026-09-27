import express from 'express';
import { listPatterns, createPattern } from '../controllers/patternController.js';

const router = express.Router();

router.get('/', listPatterns);
router.post('/', createPattern);

export default router;
