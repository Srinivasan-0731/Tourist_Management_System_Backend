import Booking from '../models/Booking.js';
import Package from '../models/Package.js';

// POST /api/bookings
const createBooking = async (req, res) => {
  try {
    console.log('=== CREATE BOOKING ===');
    console.log('user:', req.user);
    console.log('body:', req.body);

    const { packageId, travelDate, returnDate, guests, paymentMethod, specialRequests } = req.body;

    if (!packageId || !travelDate) {
      return res.status(400).json({ success: false, error: 'Package and travel date required' });
    }

    const pkg = await Package.findById(packageId);
    if (!pkg) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }

    const totalGuests  = (guests?.adults || 1) + (guests?.children || 0);
    const pricePerHead = pkg.discountPrice > 0 ? pkg.discountPrice : pkg.price;
    const totalPrice   = pricePerHead * totalGuests;

    const booking = new Booking({
      user:            req.user.id,
      package:         packageId,
      destination:     pkg.destination,
      travelDate,
      returnDate,
      guests:          guests || { adults: 1, children: 0, infants: 0 },
      totalPrice,
      paymentMethod:   paymentMethod || 'cash',
      specialRequests: specialRequests || ''
    });

    await booking.save();

    await Package.findByIdAndUpdate(packageId, { $inc: { totalBookings: 1 } });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('package',     'title price duration image packageType')
      .populate('destination', 'name country image')
      .populate('user',        'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking successful!',
      data: populatedBooking
    });

  } catch (err) {
    console.error('BOOKING ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate('package',     'title price duration image packageType')
      .populate('destination', 'name country image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (err) {
    console.error('GET MY BOOKINGS ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/bookings/:id
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('package',     'title price duration image itinerary')
      .populate('destination', 'name country image description')
      .populate('user',        'name email phone');

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    console.error('GET BOOKING ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, error: 'Already cancelled' });
    }

    // ✅ completed மட்டும் cancel பண்ண முடியாது
    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Completed bookings cannot be cancelled' });
    }

    booking.status        = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully!', data: booking });
  } catch (err) {
    console.error('CANCEL BOOKING ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/bookings  (admin)
const getAllBookings = async (req, res) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    let query = {};
    if (status) query.status = status;

    const skip     = (Number(page) - 1) * Number(limit);
    const total    = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('user',        'name email phone')
      .populate('package',     'title price')
      .populate('destination', 'name country')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    res.json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: bookings
    });
  } catch (err) {
    console.error('GET ALL BOOKINGS ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// PUT /api/bookings/:id/status  (admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, paymentStatus },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    res.json({ success: true, message: 'Status updated!', data: booking });
  } catch (err) {
    console.error('UPDATE STATUS ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
};