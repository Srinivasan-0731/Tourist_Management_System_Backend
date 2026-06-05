import express from 'express';
import { createReview, getReviewsByDestination, getMyReviews, deleteReview } from '../controllers/reviewController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/destination/:id', getReviewsByDestination);
router.post('/',               auth, createReview);
router.get('/my',              auth, getMyReviews);
router.delete('/:id',          auth, deleteReview);

export default router;