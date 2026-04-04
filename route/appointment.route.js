import express from "express";
import {
  bookAppointment,
  getAppointmentById,
  listAppointments,
  updateAppointmentStatus,
} from "../controller/appointment.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { appointmentValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "receptionist", "patient", "admin"),
  validateRequest(appointmentValidation.book),
  bookAppointment,
);
router.get(
  "/",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "doctor",
    "receptionist",
    "patient",
    "admin",
  ),
  listAppointments,
);
router.get(
  "/:id",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "doctor",
    "receptionist",
    "patient",
    "admin",
  ),
  getAppointmentById,
);
router.patch(
  "/:id/status",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "receptionist", "admin"),
  validateRequest(appointmentValidation.updateStatus),
  updateAppointmentStatus,
);

export default router;
