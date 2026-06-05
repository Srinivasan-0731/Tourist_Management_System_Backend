import express from "express";
import {
  getAllPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
} from "../controllers/packageController.js";
import { adminAuth } from "../middleware/auth.js";  // ← மாத்துங்க

const router = express.Router();

// Public
router.get("/",       getAllPackages);
router.get("/:id",    getPackage);

// Admin Only
router.post("/",      adminAuth, createPackage);
router.put("/:id",    adminAuth, updatePackage);
router.delete("/:id", adminAuth, deletePackage);

export default router;