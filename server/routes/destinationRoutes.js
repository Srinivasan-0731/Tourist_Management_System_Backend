import express from "express";
import {
  getAllDestinations,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination,
  seedDestinations,
} from "../controllers/destinationController.js";
import { auth, adminAuth } from "../middleware/auth.js";  

const router = express.Router();

// Public
router.get("/",           getAllDestinations);
router.get("/:id",        getDestination);

// Admin Only
router.post("/",          adminAuth, createDestination);
router.put("/:id",        adminAuth, updateDestination);
router.delete("/:id",     adminAuth, deleteDestination);

// Seed
router.post("/seed/data", seedDestinations);

export default router;