import express from "express";
import {
  addPatientMedicalHistory,
  createOrUpdatePatientProfile,
  getMyPatientProfile,
  getPatientById,
  listPatients,
} from "../controller/patient.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { patientValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "receptionist", "admin"),
  listPatients,
);
router.get("/me", protect, authorize("patient"), getMyPatientProfile);
router.get(
  "/:id",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "receptionist", "admin"),
  getPatientById,
);
router.post(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "patient", "receptionist", "admin"),
  validateRequest(patientValidation.createOrUpdate),
  createOrUpdatePatientProfile,
);
router.post(
  "/:id/history",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "admin"),
  validateRequest(patientValidation.addHistory),
  addPatientMedicalHistory,
);

export default router;
