import express from 'express';
import { auth, adminAuth } from '../middleware/auth.js';
import {
  isAdmin,
  getDashboardData,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  getAllDestinations,
  createDestination,
  updateDestination,
  deleteDestination,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getAllReviews,
  deleteReview,
} from '../controllers/adminController.js';

const router = express.Router();

// ── ADMIN CHECK ──────────────────────────────────────
router.get('/is-admin', adminAuth, isAdmin);

// ── DASHBOARD ────────────────────────────────────────
router.get('/dashboard', adminAuth, getDashboardData);

// ── USERS ────────────────────────────────────────────
router.get('/users',        adminAuth, getAllUsers);
router.get('/users/:id',    adminAuth, getUser);
router.put('/users/:id',    adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);

// ── DESTINATIONS ─────────────────────────────────────
router.get('/destinations',        adminAuth, getAllDestinations);
router.post('/destinations',       adminAuth, createDestination);
router.put('/destinations/:id',    adminAuth, updateDestination);
router.delete('/destinations/:id', adminAuth, deleteDestination);

// ── PACKAGES ─────────────────────────────────────────
router.get('/packages',        adminAuth, getAllPackages);
router.post('/packages',       adminAuth, createPackage);
router.put('/packages/:id',    adminAuth, updatePackage);
router.delete('/packages/:id', adminAuth, deletePackage);

// ── BOOKINGS ─────────────────────────────────────────
router.get('/bookings',         adminAuth, getAllBookings);
router.put('/bookings/:id',     adminAuth, updateBookingStatus);
router.delete('/bookings/:id',  adminAuth, deleteBooking);

// ── REVIEWS ──────────────────────────────────────────
router.get('/reviews',         adminAuth, getAllReviews);
router.delete('/reviews/:id',  adminAuth, deleteReview);

export default router;