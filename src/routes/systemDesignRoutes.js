import express from 'express';
import { getSystemDesignCurriculum } from '../controllers/systemDesignController.js';

const router = express.Router();

router.get('/', getSystemDesignCurriculum);

export default router;
