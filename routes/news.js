const express = require('express');
const { createNews, getAllNews, getNews, updateNews, deleteNews } = require('../controllers/news');
const { protect, authorize } = require('../middleware/auth');
const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const router = express.Router();

router.get('/', getAllNews);
router.get('/:id', getNews);
router.post('/', protect, authorize('admin'),upload.single('image'), createNews);
router.put('/:id', protect, authorize('admin'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);

module.exports = router;
