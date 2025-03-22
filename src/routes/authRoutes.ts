import express from "express";
import { login, logout, signup } from "../controller/authController";
import { IsAuthenticated } from "../middleware/protectRoute";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout",IsAuthenticated, logout);


export default router;
