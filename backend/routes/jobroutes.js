import express from 'express';
import {authMiddleware,authorize} from '../middleware/AuthMiddleware.js';
import {upload} from '../middleware/uploadMiddleware.js';
import {
    createJob,
    getDashboardStats,
    getJobsByAdmin,
    getAllJobs,
    getJobById,
    updateJob,
    deleteJob,
    closeJob
} from '../controllers/jobcontroller.js';

const jobRouter=express.Router();

jobRouter.post('/',authMiddleware,authorize("admin"),upload.single("companylogo"),createJob);
jobRouter.get('/admin/stats',authMiddleware,authorize("admin"),getDashboardStats);
jobRouter.get('/admin/jobs',authMiddleware,authorize("admin"),getJobsByAdmin);
jobRouter.get('/',getAllJobs);
jobRouter.get('/:id',getJobById);

jobRouter.put("/:id",authMiddleware,authorize("admin"),upload.single("companylogo"),updateJob);

jobRouter.delete("/:id",authMiddleware,authorize("admin"),deleteJob);
jobRouter.patch("/:id/close",authMiddleware,authorize("admin"),closeJob);

export default jobRouter;