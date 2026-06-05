import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} from '../controllers/bookingController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// SPECIFIC ROUTES FIRST 
router.get('/my',         auth, getMyBookings);
router.put('/:id/cancel', auth, cancelBooking);
router.put('/:id/status', adminAuth, updateBookingStatus);
router.get('/:id',        auth, getBooking);

// GENERAL ROUTES LAST 
router.post('/',          auth, createBooking);
router.get('/',           adminAuth, getAllBookings);

export default router;