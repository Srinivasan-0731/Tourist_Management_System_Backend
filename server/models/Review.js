import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  images: [String],
  isApproved: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

reviewSchema.index({ user: 1, destination: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);
export default Review;