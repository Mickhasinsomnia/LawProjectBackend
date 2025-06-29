const express = require('express');
const { createArticle, getArticles, getArticle, updateArticle, deleteArticle,likeArticle,unlikeArticle,likeCheck } = require('../controllers/article');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
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

module.exports = router;
