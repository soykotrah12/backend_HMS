import express from "express";
import {
  getUser,
  allUsers,
  deleteUser,
  updateUser,
} from "../controller/admin.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("superAdmin", "admin"));

router.get("/users", allUsers);
router.get("/user/:id", getUser);
router.put("/user/:id", updateUser);
router.delete("/user/:id", deleteUser);

export default router;
