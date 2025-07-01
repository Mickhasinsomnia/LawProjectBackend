import express from 'express';
import { createArticle, getArticles, getArticle, updateArticle, deleteArticle,likeArticle,unlikeArticle,likeCheck } from '../controllers/article.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const router = express.Router();

router.get('/', getArticles);
router.get('/:id', getArticle);
router.post('/', protect, authorize('admin','lawyer'), upload.single('image'),createArticle);
router.put('/:id', protect, authorize('admin','lawyer'), upload.single('image'), updateArticle);
router.delete('/:id', protect, authorize('admin','lawyer'), deleteArticle);
router.post('/:articleId/like', protect,likeArticle);
router.delete('/:articleId/like', protect,unlikeArticle);
router.get('/:articleId/like', protect,likeCheck);

export default router;
