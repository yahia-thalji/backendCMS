import express from 'express'
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';
import { getUserProfile, updateUser } from '../controller/userController';
import { uploadSingle } from '../middleware/multerMiddleware';

const router = express.Router();

router.get("/profile/:id" ,isAuthorized, getUserProfile);
router.post("/update/:id" , isAuthorized ,uploadSingle,updateUser);


export default router;