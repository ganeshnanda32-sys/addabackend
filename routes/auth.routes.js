import express from "express";
import {
  sendOtp,
  register,
  login,
  completeProfile
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/register", register);
router.post("/complete-profile", authMiddleware, completeProfile);
router.post("/login", login);

export default router;
