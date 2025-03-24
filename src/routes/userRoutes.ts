import express from 'express'
import { IsAuthenticated, isAuthorized } from '../middleware/protectRoute';
import { getUserProfile, updateUser } from '../controller/userController';

const router = express.Router();

router.get("/profile/:id" , getUserProfile);
router.post("/update" , isAuthorized,updateUser);


export default router;