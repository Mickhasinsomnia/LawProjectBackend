import express from "express";
import { getReview, getAllReview, createReview, updateReview, deleteReview } from '../controllers/review.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/lawyer/:id', getAllReview);
router.route('/:id').get(getReview).put(protect, updateReview).delete(protect, deleteReview);
router.post('/', protect, createReview);

export default router;
