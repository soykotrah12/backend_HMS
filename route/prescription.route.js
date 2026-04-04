import express from "express";
import {
  createPrescription,
  getPrescriptionById,
  listPrescriptions,
} from "../controller/prescription.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { prescriptionValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("doctor"),
  validateRequest(prescriptionValidation.create),
  createPrescription,
);
router.get(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "patient", "pharmacist", "admin"),
  listPrescriptions,
);
router.get(
  "/:id",
  protect,
  authorize("superAdmin", "hospitalAdmin", "doctor", "patient", "pharmacist", "admin"),
  getPrescriptionById,
);

export default router;
