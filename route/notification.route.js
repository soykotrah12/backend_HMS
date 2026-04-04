import express from "express";
import {
  createNotification,
  listMyNotifications,
  markNotificationAsRead,
} from "../controller/notification.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { notificationValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "receptionist", "admin"),
  validateRequest(notificationValidation.create),
  createNotification,
);
router.get("/me", protect, listMyNotifications);
router.patch("/me/:id/read", protect, markNotificationAsRead);

export default router;
