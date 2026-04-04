import express from "express";
import {
  createOrUpdateDoctorProfile,
  getDoctorById,
  getMyDoctorProfile,
  listDoctors,
  setDoctorAvailability,
} from "../controller/doctor.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { doctorValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "receptionist",
    "doctor",
    "patient",
    "admin",
  ),
  listDoctors,
);
router.get("/me", protect, authorize("doctor"), getMyDoctorProfile);
router.get("/:id", protect, getDoctorById);
router.post(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "admin"),
  validateRequest(doctorValidation.createOrUpdate),
  createOrUpdateDoctorProfile,
);
router.patch(
  "/:id/availability",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "admin"),
  validateRequest(doctorValidation.setAvailability),
  setDoctorAvailability,
);

export default router;
