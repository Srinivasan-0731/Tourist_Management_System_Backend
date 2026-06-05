import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination'
  },
  travelDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  guests: {
    adults:   { type: Number, default: 1, min: 1 },
    children: { type: Number, default: 0 },
    infants:  { type: Number, default: 0 }
  },
  totalGuests: {
    type: Number,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'upi', 'netbanking', 'razorpay'],
    default: 'cash'
  },
  specialRequests: {
    type: String,
    default: ''
  },
  bookingId: {
    type: String,
    unique: true
  },

  // Razorpay fields
  razorpayOrderId: {
    type: String,
    default: ''
  },
  razorpayPaymentId: {
    type: String,
    default: ''
  },
  razorpaySignature: {
    type: String,
    default: ''
  },

}, { timestamps: true });

bookingSchema.pre('save', async function () {
  if (!this.bookingId) {
    this.bookingId = 'TMS' + Date.now() + Math.floor(Math.random() * 1000);
  }
  this.totalGuests = (this.guests?.adults || 1) + (this.guests?.children || 0);
});

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;