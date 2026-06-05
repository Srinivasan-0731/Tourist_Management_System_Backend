import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: false
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: '7 Days'
  },
  maxGuests: {
    type: Number,
    default: 20
  },
  packageType: {
    type: String,
    enum: ['budget', 'standard', 'premium', 'luxury'],
    default: 'standard'
  },
  highlights:  [String],
  included:    [String],
  notIncluded: [String],
  itinerary: [{
    day:         Number,
    title:       String,
    description: String,
    activities:  [String]
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Package = mongoose.model('Package', packageSchema);
export default Package;