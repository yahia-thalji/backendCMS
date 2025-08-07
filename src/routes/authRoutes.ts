import express from "express";
import {
    getMe,
    login,
    logout,
    requestPasswordReset,
    resetPassword,
    signup,
    verifyResetCode
} from "../controller/authController";

import { IsAuthenticated, isAuthorized } from "../middleware/protectRoute";
import { validateInputs } from "../middleware/validationMiddlewares";
const router = express.Router();

router.post("/signup", validateInputs, signup);
router.post("/login", validateInputs, login);
router.post("/logout", IsAuthenticated, logout);
router.get("/me", IsAuthenticated, getMe);

router.post("/forgot-password", validateInputs, requestPasswordReset);
router.post("/verify-reset-code", validateInputs, verifyResetCode);
router.post("/reset-password", validateInputs, resetPassword);

export default router;