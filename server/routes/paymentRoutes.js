import express from 'express';
import { createOrder, verifyPayment, paymentFailed } from '../controllers/paymentController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', auth, createOrder);
router.post('/verify',       auth, verifyPayment);
router.post('/failed',       auth, paymentFailed);

export default router;