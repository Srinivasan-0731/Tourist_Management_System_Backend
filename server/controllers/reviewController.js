import Review from '../models/Review.js';
import Destination from '../models/Destination.js';

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { destinationId, rating, title, comment } = req.body;

    if (!destinationId || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Destination, rating and comment required' });
    }

    const existing = await Review.findOne({ user: req.user.id, destination: destinationId });
    if (existing) {
      return res.status(400).json({ success: false, error: 'You already reviewed this destination' });
    }

    const review = await Review.create({ user: req.user.id, destination: destinationId, rating, title, comment });

    const allReviews = await Review.find({ destination: destinationId });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Destination.findByIdAndUpdate(destinationId, {
      rating:       Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    const populated = await Review.findById(review._id).populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted!', data: populated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/reviews/destination/:id
const getReviewsByDestination = async (req, res) => {
  try {
    const reviews = await Review.find({ destination: req.params.id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/reviews/my
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('destination', 'name country image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE /api/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Review.findByIdAndDelete(req.params.id);

    const allReviews = await Review.find({ destination: review.destination });
    const avgRating  = allReviews.length > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      : 0;
    await Destination.findByIdAndUpdate(review.destination, {
      rating:       Math.round(avgRating * 10) / 10,
      totalReviews: allReviews.length
    });

    res.json({ success: true, message: 'Review deleted!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export { createReview, getReviewsByDestination, getMyReviews, deleteReview };