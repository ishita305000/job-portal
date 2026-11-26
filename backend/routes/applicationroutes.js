import express from 'express';
import { authMiddleware,authorize } from '../middleware/AuthMiddleware.js';
import { applyJob,getApplicants,getUserApplications } from '../controllers/applicationcontroller.js';

const applicationRouter=express.Router();

applicationRouter.post('/apply/:id',authMiddleware,applyJob);

applicationRouter.get('/user',authMiddleware,getUserApplications);
applicationRouter.get('/:id/applicants',authMiddleware,authorize("admin"),getApplicants)

export default applicationRouter;