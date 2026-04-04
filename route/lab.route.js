import express from "express";
import {
  bookLabTest,
  getLabTestById,
  listLabTests,
  updateLabTestStatus,
  uploadLabReport,
} from "../controller/lab.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { labValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "receptionist", "doctor", "admin"),
  validateRequest(labValidation.book),
  bookLabTest,
);
router.get(
  "/",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "labTechnician",
    "doctor",
    "receptionist",
    "admin",
  ),
  listLabTests,
);
router.get(
  "/:id",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "labTechnician",
    "doctor",
    "receptionist",
    "patient",
    "admin",
  ),
  getLabTestById,
);
router.patch(
  "/:id/status",
  protect,
  authorize("superAdmin", "hospitalAdmin", "labTechnician", "admin"),
  validateRequest(labValidation.updateStatus),
  updateLabTestStatus,
);
router.patch(
  "/:id/report",
  protect,
  authorize("superAdmin", "hospitalAdmin", "labTechnician", "admin"),
  upload.single("report"),
  uploadLabReport,
);
router.patch(
  "/:id/report-url",
  protect,
  authorize("superAdmin", "hospitalAdmin", "labTechnician", "admin"),
  validateRequest(labValidation.updateReportByUrl),
  uploadLabReport,
);

export default router;
