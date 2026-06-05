import Razorpay from 'razorpay';
import crypto from 'crypto';
import Booking from '../models/Booking.js';

// POST /api/payments/create-order
const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ success: false, error: 'Razorpay keys not configured' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const amountInPaise = booking.totalPrice * 100;

    // ✅ Razorpay test mode max ₹5,00,000 check
    if (amountInPaise > 50000000) {
      return res.status(400).json({
        success: false,
        error: `Amount ₹${booking.totalPrice.toLocaleString('en-IN')} exceeds Razorpay test limit of ₹5,00,000. Please reduce number of guests.`
      });
    }

    const razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount:   amountInPaise,
      currency: 'INR',
      receipt:  `receipt_${bookingId}`,
      notes: {
        bookingId,
        userId:      req.user.id,
        packageName: booking.package?.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        orderId:   order.id,
        amount:    order.amount,
        currency:  order.currency,
        bookingId: bookingId,
        keyId:     process.env.RAZORPAY_KEY_ID,
      }
    });
  } catch (err) {
    console.error('CREATE ORDER ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/payments/verify
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    const body     = razorpay_order_id + '|' + razorpay_payment_id;
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        paymentStatus:     'paid',
        status:            'confirmed',
        razorpayOrderId:   razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Payment verified successfully!',
      data: booking,
    });
  } catch (err) {
    console.error('VERIFY PAYMENT ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// POST /api/payments/failed
const paymentFailed = async (req, res) => {
  try {
    const { bookingId } = req.body;

    await Booking.findByIdAndUpdate(bookingId, {
      paymentStatus: 'unpaid',
      status:        'pending',
    });

    res.json({ success: true, message: 'Payment failure recorded' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createOrder, verifyPayment, paymentFailed };