import express from 'express';
import {authMiddleware} from '../middleware/AuthMiddleware.js';
import { getSavedItems,toggleSaveJob,toggleSaveQuestion } from '../controllers/savedcontroller.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/',getSavedItems);
router.post('/job/:jobId',toggleSaveJob);
router.post('/question/:questionId',toggleSaveQuestion);

export default router;