import express from 'express';
import { createNews, getAllNews, getNews, updateNews, deleteNews, likeNews, unlikeNews, likeCheck } from '../controllers/news.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/', getAllNews);
router.get('/:id', getNews);
router.post('/', protect, authorize('admin'), upload.single('image'), createNews);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);
router.post('/:newsId/like', protect, likeNews);
router.delete('/:newsId/like', protect, unlikeNews);
router.get('/:newsId/like', protect, likeCheck);

export default router;
