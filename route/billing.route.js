import express from "express";
import {
  addInvoicePayment,
  createInvoice,
  getInvoiceById,
  listInvoices,
} from "../controller/billing.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";
import validateRequest from "../middleware/validate.middleware.js";
import { invoiceValidation } from "../utils/validationSchema.js";

const router = express.Router();

router.post(
  "/invoice",
  protect,
  authorize("superAdmin", "hospitalAdmin", "receptionist", "admin"),
  validateRequest(invoiceValidation.create),
  createInvoice,
);
router.patch(
  "/invoice/:id/pay",
  protect,
  authorize("superAdmin", "hospitalAdmin", "receptionist", "admin"),
  validateRequest(invoiceValidation.addPayment),
  addInvoicePayment,
);
router.get(
  "/invoice",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "receptionist",
    "patient",
    "admin",
  ),
  listInvoices,
);
router.get(
  "/invoice/:id",
  protect,
  authorize(
    "superAdmin",
    "hospitalAdmin",
    "receptionist",
    "patient",
    "admin",
  ),
  getInvoiceById,
);

export default router;
