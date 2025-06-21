const express = require('express');
const { createNews, getAllNews, getNews, updateNews, deleteNews, likeNews, unlikeNews, likeCheck } = require('../controllers/news');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

router.get('/', getAllNews);
router.get('/:id', getNews);
router.post('/', protect, authorize('admin'),upload.single('image'), createNews);
router.put('/:id', protect, authorize('admin'),upload.single('image'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);
router.post('/:newsId/like', protect,likeNews);
router.delete('/:newsId/like', protect,unlikeNews);
router.get('/:newsId/like', protect,likeCheck);

module.exports = router;
