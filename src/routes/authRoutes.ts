import express from "express";
import { getMe, login, logout, signup } from "../controller/authController";
import { IsAuthenticated, isAuthorized } from "../middleware/protectRoute";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",IsAuthenticated, logout);
router.get("/me", IsAuthenticated,getMe);


export default router;
