
import express from "express";
import {
  changePassword,
  getProfile,
  updateProfile,
  blockUser,
  unblockUser,
  listUsers,
  updateUserRole,
} from "../controller/user.controller.js";

import { authorize, protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { userValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.get("/profile", protect, getProfile);
router.put(
  "/profile",
  protect,
  validateRequest(userValidation.updateProfile),
  upload.single("avatar"),
  updateProfile,
);
router.put("/password", protect, changePassword);
router.patch("/block/:userId", protect, blockUser);
router.patch("/unblock/:userId", protect, unblockUser);
router.get(
  "/all",
  protect,
  authorize("superAdmin", "hospitalAdmin", "admin"),
  listUsers,
);
router.patch(
  "/role/:id",
  protect,
  authorize("superAdmin", "hospitalAdmin", "admin"),
  validateRequest(userValidation.updateRole),
  updateUserRole,
);

export default router;
