import express from 'express'
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';
import { getAllUsers, getUserProfile, updateUser } from '../controller/userController';
import { uploadSingle } from '../middleware/multerMiddleware';

const router = express.Router();

router.get("/profile/:id" , getUserProfile);
router.post("/update/:id"  ,uploadSingle,updateUser);
router.get("/getAllUsers" ,getAllUsers)

export default router;