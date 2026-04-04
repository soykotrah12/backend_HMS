import express from "express";

import authRoute from "../route/auth.route.js";
import adminRoute from "../route/admin.route.js";
import userRoute from "../route/user.route.js";
import doctorRoute from "../route/doctor.route.js";
import patientRoute from "../route/patient.route.js";
import appointmentRoute from "../route/appointment.route.js";
import prescriptionRoute from "../route/prescription.route.js";
import pharmacyRoute from "../route/pharmacy.route.js";
import labRoute from "../route/lab.route.js";
import billingRoute from "../route/billing.route.js";
import notificationRoute from "../route/notification.route.js";

const router = express.Router();

router.use("/auth", authRoute);
router.use("/admin", adminRoute);
router.use("/user", userRoute);
router.use("/doctor", doctorRoute);
router.use("/patient", patientRoute);
router.use("/appointment", appointmentRoute);
router.use("/prescription", prescriptionRoute);
router.use("/pharmacy", pharmacyRoute);
router.use("/lab", labRoute);
router.use("/billing", billingRoute);
router.use("/notification", notificationRoute);

export default router;
