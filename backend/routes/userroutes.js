import express from 'express';
import { authMiddleware, authorize } from '../middleware/AuthMiddleware.js';
import { getProfile, updateProfile, getResume } from '../controllers/usercontroller.js';
import { upload } from '../middleware/uploadMiddleware.js';


const userRouter=express.Router();

userRouter.get('/profile',authMiddleware,getProfile)
userRouter.get('/resume/:id',getResume);

userRouter.put('/profile',authMiddleware,authorize("user"),upload.single("resume"),updateProfile);

export default userRouter;