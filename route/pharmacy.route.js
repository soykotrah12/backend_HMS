import express from "express";
import {
  createMedicine,
  deleteMedicine,
  getMedicineById,
  listMedicines,
  updateMedicine,
  updateMedicineStock,
} from "../controller/pharmacy.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { medicineValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("superAdmin", "hospitalAdmin", "pharmacist", "admin"),
  validateRequest(medicineValidation.create),
  createMedicine,
);
router.get(
  "/",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "pharmacist",
    "doctor",
    "receptionist",
    "admin",
  ),
  listMedicines,
);
router.get(
  "/:id",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "pharmacist",
    "doctor",
    "receptionist",
    "admin",
  ),
  getMedicineById,
);
router.put(
  "/:id",
  protect,
  authorize("superAdmin", "hospitalAdmin", "pharmacist", "admin"),
  updateMedicine,
);
router.patch(
  "/:id/stock",
  protect,
  authorize("superAdmin", "hospitalAdmin", "pharmacist", "admin"),
  validateRequest(medicineValidation.updateStock),
  updateMedicineStock,
);
router.delete(
  "/:id",
  protect,
  authorize("superAdmin", "hospitalAdmin", "pharmacist", "admin"),
  deleteMedicine,
);

export default router;
