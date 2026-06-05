import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  images: [{ type: String }],
  category: {
    type: String,
    enum: ['beach', 'mountain', 'city', 'adventure', 'cultural', 'wildlife'],
    default: 'city'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  duration: {
    type: String,
    default: '7 Days'
  },
  featured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  location: {
    city: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  highlights:   [String],
  included:     [String],
  notIncluded:  [String]
}, { timestamps: true });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;