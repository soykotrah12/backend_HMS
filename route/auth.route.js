import express from "express";
import {
  changePassword,
  forgetPassword,
  login,
  logout,
  refreshToken,
  register,
  resetPassword,
  verifyOTP,
} from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { authValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post("/register", validateRequest(authValidation.register), register);
router.post("/login", validateRequest(authValidation.login), login);
router.post("/verify", validateRequest(authValidation.verifyOtp), verifyOTP);
router.post("/forget", validateRequest(authValidation.forgotPassword), forgetPassword);
router.post("/reset-password", validateRequest(authValidation.resetPassword), resetPassword);
router.post(
  "/change-password",
  protect,
  validateRequest(authValidation.changePassword),
  changePassword,
);
router.post("/refresh-token", validateRequest(authValidation.refreshToken), refreshToken);
router.post("/logout", protect, logout);

export default router;
