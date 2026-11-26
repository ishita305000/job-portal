import express from 'express';
import { getCompanies, addCompany,deleteCompany } from '../controllers/companycontroller.js';
import { authMiddleware, authorize } from '../middleware/AuthMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const companyRouter=express.Router();

companyRouter.get('/',getCompanies)
companyRouter.post('/',authMiddleware,authorize("admin"),upload.single("logo"),addCompany);

companyRouter.delete("/:id",authMiddleware,authorize("admin"),deleteCompany);

export default companyRouter;